const mongoose = require('mongoose');
const db = require('./index');
const PlanningModel = require('./Models/planning');


function convertDateStringToUTCDate(date) {
    /**
     * Converti une chaine au format 'jj/mm/aaaa' en UTC Date String.
     * Si la chaine donnée en argument est vide, on renvoie
     * la date du jour en UTC Date String initialisée à minuit.
     */
    // Conversion de la date en Date Object
    let utcDateObject;
    if (date == '') {
        let jetlag = 2;
        dateNow = new Date()
        utcDateNow = Date.UTC(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours() + jetlag, dateNow.getUTCMinutes(), dateNow.getUTCSeconds())
        utcDateObject = new Date(new Date(utcDateNow).setUTCHours(0, 0, 0));
    }
    else {
        let [day, month, year] = date.split('/');
        utcDateObject = new Date(Date.UTC(year, Number(month) - 1, day));
    }
    return utcDateObject;
}


function createPlanningDocument(aurionID, planningResponse) {
    /**
     * @param {String} aurionID - Identifiant aurion
     * @param {Object} planningResponse - Réponse de l'API AurionScrapper après demande de planning
     * @return {mongoose.Document} Document suivant le modele dans ./models/planning
     */

    const doc = new PlanningModel({
        _id: new mongoose.Types.ObjectId(),
        aurionID: aurionID,
        weeks: planningResponse
    },
        { collection: 'planning' });
    return doc;
}


function updateWeek(aurionID, date, updatedWeek) {
    /**
     * @param {String} date - jj/mm/aaaa
     * @return {Bool} true s'il y a au moins une modification
     *                false sinon (ou s'il y a eu des erreurs)
     */

    // On recherche la date du lundi de la semaine de la date donnée car on va
    // effectuer une recherche dans la bdd en fonction de la key beginDate
    let utcDate = convertDateStringToUTCDate(date);
    while (utcDate.getDay() != 1) { // On se ramène à un lundi (1), sachant que 
        utcDate.setDate(utcDate.getDate() - 1);
    }
    let utcDateStringWithoutTime = utcDate.toUTCString().split(' 00:')[0];

    // Dans la liste weeks, on met à jour la liste days de la semaine à update
    try {
        PlanningModel.updateOne({
            aurionID: aurionID,
            'weeks.beginDate': utcDateStringWithoutTime
        },
            {
                $set: {
                    'weeks.$.days': updatedWeek.days
                }
            },
            function (err, docs) {
                if (err) {
                    console.log(err)
                    return false;
                }
                else {
                    console.log("Original Doc : ", docs);
                    if (docs.nModified > 0) {
                        return true
                    }
                    return false;
                }
            });
    } catch (error) {
        console.log(error);
        return false;
    }
}


function getUserPlanningDoc(aurionID) {
    /**
     * @param {String} aurionID
     * @return {Object} Renvoie :
     *                  - le document de planning correspond à studentAurionID
     *                  - null si document non trouvé
     *                  - 'ERROR' si une erreur s'est produite
     * 
     * Rappel d'utilisation : To use await, its executing context needs to be async in nature
     */

    return new Promise((resolve, reject) => {
        try {
            const doc = PlanningModel.findOne({ aurionID: aurionID });
            if (doc == null) {
                console.log(`getUserPlanningDoc --> ${aurionID} n'est PAS présent dans la collection "plannings".`)
            }
            console.log(`getUserPlanningDoc --> Document de Planning de ${aurionID} récupéré dans la collection "plannings".`)
            resolve(doc);
        } catch (error) {
            console.log(`getUserPlanningDoc error --> ${error}`);
            reject('ERROR');
        }
    });
}


async function getWeeks(studentAurionID) {
    /**
     * @param {String} studentAurionID
     * @return {Object} - Par défaut : liste des dictionnaires de notes
     *                  - Liste vide si eleve non présent dans la BDD
     *                  - 'ERROR' si une erreur s'est produite
     * 
     * Rappel d'utilisation : To use await, its executing context needs to be async in nature
     */

    try {
        let doc = await getUserPlanningDoc(studentAurionID);
        if (doc == null) return [];
        if (doc == 'ERROR') return 'ERROR';
        else return doc.weeks;
    } catch (error) {
        console.log(`getWeeks error --> ${error}`);
        return 'ERROR';
    }
}


async function findWeekPlanningFromDate(aurionID, date) {
    /**
     * Recherche parmi les semaines enregistrés dans la database
     * celle qui contient la date donnée en argument (au format 'jj/mm/yyyy').
     * 
     * Renvoie l'Object de l'array 'weeks' qui contient cette date
     * Si cette date n'est présente dans aucune semaine sauvegardée,
     * renvoie null.
     */

    let utcDateObject = convertDateStringToUTCDate(date);

    // Si c'est un dimanche, on recule d'un jour car dans la 
    // Database, une semaine va du lundi au samedi
    if (utcDateObject.getDay() == 0) {
        utcDateObject.setDate(utcDateObject.getDate() - 1);
    }

    let utcDateString = utcDateObject.toUTCString();

    // On récupère la liste des semaines dispo dans la BDD pour l'user
    let Weeks = await getWeeks(aurionID);
    if (Weeks == 'ERROR' || Weeks == []) {
        console.log(`findWeekPlanningFromDate error --> Aucune semaine trouvée dans le Planning Doc de ${aurionID} contenant ${utcDateString}`);
        return null;
    }
    // Parmi les semaines dispo sur la BDD pour l'user, on cherche s'il y
    // en a une qui contient la date demandée
    for (w of Weeks) {
        if (Object.keys(w.days).includes(utcDateString)) {
            console.log(`findWeekPlanningFromDate --> semaine du ${utcDateString} trouvée dans le Planning Doc de ${aurionID}`);
            return w;
        }
    }
    return null;
}


async function addWeekToPlanningDoc(aurionID, weekToAdd) {

    let userPlanningDoc = await getUserPlanningDoc(aurionID);
    if (userPlanningDoc != 'ERROR' || userPlanningDoc != null) {
        userPlanningDoc.weeks.push(weekToAdd);
        userPlanningDoc.weeks.sort(function (a, b) {
            return (new Date(b.beginDate) - new Date(a.beginDate));
        });
        db.save.saveDoc(userPlanningDoc);
        return true;
    }
    else return false;
}


module.exports = {
    createPlanningDocument,
    updateWeek,
    getWeeks,
    findWeekPlanningFromDate,
    addWeekToPlanningDoc
}