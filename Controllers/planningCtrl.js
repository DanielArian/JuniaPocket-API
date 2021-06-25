const axios = require('axios');
const mongoose = require('mongoose');

const sCode = require('../httpStatus');
const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');
const { getAurionPassword } = require('../Database/manageUser');
const notify = require('../notify');


function firstTimeDone(req, aurionID) {
    // On enleve l'aurionID de la liste des utilisateurs entrain de récupérer leur PLANNING
    // Pour la première fois
    let index = req.app.locals.listOfUsersCurrentlyGettingPlanningForFirstTime.indexOf(aurionID);
    if (index > -1) { // si c'est la première recup
        req.app.locals.listOfUsersCurrentlyGettingPlanningForFirstTime.splice(index, 1);
    }
}


async function getPlanningOfWeek (req, res) {
    
    let aurionID = req.user.aurionID;   // assuré par le middleware auth.js ou à l'inscription pour première recup
    let date = req.body.date;       // assuré par le middleware requireWeekDate.js
                                    // au format jj/mm/aaaa ou ''

    if (req.body.hasOwnProperty('aurionIDForAnotherUser')) { // requête pour un autre membre de groupe
        aurionID = req.body.aurionIDForAnotherUser;
        console.log('aurionIDForAnotherUser:', req.body.aurionIDForAnotherUser);
    }


    // On récupère les éventuelles semaines sauvegardées dans la bdd par l'user
    let availableWeeks = await db.managePlanning.getWeeks(aurionID, db.Models.Planning);


    // Si des semaines sont déjà sauv dans la Database, on cherche si la date de la semaine
    // demandée est déjà comprise dans une de ces semaines.

    if (availableWeeks.length > 0) {
        let week = await db.managePlanning.findWeekPlanningFromDate(aurionID, date);

        // Si la semaine demandée est déjà sauvegardée dans la Database
        if (week != null) {
            return res.status(sCode.OK).send(JSON.stringify(week));
        }
    }

    // Sinon, on récupère sur Aurion et on rajoute la semaine demandée dans la database
    
    // Si c'est la première fois que l'utilisateur récupère un planning
    // On indique qu'une récupération est en cours pour empecher que cette meme requete
    // soit refaite avant la fin de celle-ci (via middleware isCurrentlyGettingPlanninfFTFT.js).
    // Sinon l'user aura plusieurs planning Documents
    if (availableWeeks.length == 0) {
        req.app.locals.listOfUsersCurrentlyGettingPlanningForFirstTime.push(aurionID);
    }


    // Récupération Planning sur Aurion
    console.log(`Récupération du planning de ${aurionID} dans la semaine du ${date}`);
    let requestedWeek;
    try {
        let aurionPassword = await getAurionPassword(aurionID);
        let planningPage = await aurionScrapper.fetch.planning(aurionID, aurionPassword, date);
        if (planningPage == 'Username ou mot de passe invalide.') {
            firstTimeDone(req, aurionID);
            return res.status(sCode.unauthorized).json({error: 'IDENTIFIANTS_AURION_MODIFIES'});
        }
        requestedWeek = aurionScrapper.formatPlanning.responseWeekPlanning(planningPage);
    } catch (error) {
        console.log(`getPlanningOfWeek error --> Echec récupération planning aurion de ${aurionID} dans la semaine du ${date}`);
        firstTimeDone(req, aurionID);
        return res.status(sCode.serverError).json({ error });
    }

    // Ajout dans la Database de la semaine récup
    try {
        if (availableWeeks.length == 0) {
            const doc = db.managePlanning.createPlanningDocument(aurionID, requestedWeek);
            db.save.saveDoc(doc);
            firstTimeDone(req, aurionID);
        }
        else {
            db.managePlanning.addWeekToPlanningDoc(aurionID, requestedWeek);
        }
        return res.status(sCode.OK).send(JSON.stringify(requestedWeek));
    } catch (error) {
        console.log(`getPlanningOfWeek error --> Echec sauvegarde planning aurion de ${aurionID} dans la semaine du ${date}`);
        firstTimeDone(req, aurionID);
        return res.status(sCode.serverError).json({ error });
    }
}


async function updateWeek (req, res) {

    let aurionID = req.user.aurionID;   // assuré par le middleware auth.js
    let date = req.body.date;           // assuré par le middleware requireWeekDate.js
                                        // au format jj/mm/aaaa

    let weekToUpdate;                   // semaine stockée dans notre BDD

    // On vérifie s'il existe bien une semaine à la date demandée dans la Database
    let availableWeeks = await db.managePlanning.getWeeks(aurionID, db.Models.Planning);
    if (availableWeeks.length == 0) {
            return res.status(sCode.notFound).json({error: `Pas de semaine à la date du ${date} dans la Database`});
    }
    else {
        weekToUpdate = await db.managePlanning.findWeekPlanningFromDate(aurionID, date);
        if (!weekToUpdate) {    // semaine non existante dans la Database
            return res.status(sCode.notFound).json({error: `Pas de semaine à la date du ${date} dans la Database`});
        }
    }

    // Récupération sur Aurion du Planning Semaine demandée 
    console.log(`Récupération du planning de ${aurionID} dans la semaine du ${date}`);
    let requestedWeek;
    try {
        let aurionPassword = await getAurionPassword(aurionID);
        let planningPage = await aurionScrapper.fetch.planning(aurionID, aurionPassword, date);
        if (planningPage == 'Username ou mot de passe invalide.') {
            return res.status(sCode.unauthorized).json({error: 'IDENTIFIANTS_AURION_MODIFIES'});
        }
        requestedWeek = aurionScrapper.formatPlanning.responseWeekPlanning(planningPage);
    } catch (error) {
        console.log(`getPlanningOfWeek error --> Echec récupération planning aurion de ${aurionID} dans la semaine du ${date}`);
        return res.status(sCode.serverError).json({ error });
    }


    // On vérifie s'il y a eu des modification d'emploi du temps
    let listOfModifiedDays = db.managePlanning.getListOfModifiedDays(weekToUpdate, requestedWeek);

    // S'il y a modification et que mise à jour automatique
    // on envoie une notification à l'utilisateur
    if (listOfModifiedDays.length > 0 ) {
        // Génération contenu de la notif
        let notifTitle = `Modifications Planning détectées : ${listOfModifiedDays[0]}`;
        let notifContent = ``;
        if (listOfModifiedDays.length > 1) {
            notifTitle = `Modifications Planning détectées aux dates suivantes :`;
            for (date of listOfModifiedDays) {
                notifContent += date + '\n';
            }
        }
        // Envoi de la notif
        notify(aurionID, notifTitle, notifContent);
    }
    else {
        console.log(`updateWeek --> Pas de modifications de planning dans la semaine du ${date}`);
    }

    // Mise à jour dans la BDD de la semaine demandée
    try {
        let resultUpdate = await db.managePlanning.updateWeek(aurionID, date, requestedWeek);
        return res.status(sCode.OK).send(JSON.stringify(requestedWeek));

    } catch (error) {
        console.log(error);
        return res.status(sCode.serverError).send(JSON.stringify(error));
    }
}


async function getCommonAvailableTimeSlots (req, res) {

    let groupID = req.body.groupID;
    let date = req.body.date;

    let groupDoc = await db.Models.Group.findOne({'_id': mongoose.Types.ObjectId(groupID)});
    let listOfAurionID = groupDoc.list;

    for (aurionID of listOfAurionID) {
        let result = await db.managePlanning.findWeekPlanningFromDate(aurionID, date);
        if (result == null) {
            const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const dataToSend = {
                aurionIDForAnotherUser: aurionID,
                date: date
            }
            await axios
                .post(`https://juniapocketapi.herokuapp.com/planning/get-week`, dataToSend, config)
        }
    }
    let obj = await db.managePlanning.getCommonAvailableTimeSlots(listOfAurionID, date);
    return res.status(sCode.OK).send(JSON.stringify(obj));
}


module.exports = {
    getPlanningOfWeek,
    updateWeek,
    getCommonAvailableTimeSlots
}