const sCode = require('../httpStatus');

const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');
const { getAurionPassword } = require('../Database/manageUser');
const notify = require('../notify');


exports.getPlanningOfWeek = async (req, res) => {
    
    let aurionID = req.user.aurionID;   // assuré par le middleware auth.js
    let date = req.body.date;       // assuré par le middleware requireWeekDate.js
                                    // au format jj/mm/aaaa

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
            return res.status(sCode.unauthorized).json({error: 'Les identifiants aurion ne sont plus valides.'})
        }
        requestedWeek = aurionScrapper.formatPlanning.responseWeekPlanning(planningPage);
    } catch (error) {
        console.log(`getPlanningOfWeek error --> Echec récupération planning aurion de ${aurionID} dans la semaine du ${date}`);
        return res.status(sCode.serverError).json({ error });
    }

    // Ajout dans la Database de la semaine récup
    try {
        if (availableWeeks.length == 0) {
            const doc = db.managePlanning.createPlanningDocument(aurionID, requestedWeek);
            db.save.saveDoc(doc);
            // On enleve l'aurionID de la liste des utilisateurs entrain de récupérer leur Planning
            // Pour la première fois
            let index = req.app.locals.listOfUsersCurrentlyGettingPlanningForFirstTime.indexOf(aurionID);
            req.app.locals.listOfUsersCurrentlyGettingPlanningForFirstTime.splice(index, 1);
        }
        else {
            db.managePlanning.addWeekToPlanningDoc(aurionID, requestedWeek);
        }
        return res.status(sCode.OK).send(JSON.stringify(requestedWeek));
    } catch (error) {
        console.log(`getPlanningOfWeek error --> Echec sauvegarde planning aurion de ${aurionID} dans la semaine du ${date}`);
        return res.status(sCode.serverError).json({ error });
    }
}


exports.updateWeek = async (req, res) => {

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
            return res.status(sCode.unauthorized).json({error: 'Les identifiants aurion ne sont plus valides.'})
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
    if (listOfModifiedDays.length > 0 && req.body.hasOwnProperty('isAutomaticUpdate')) {
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