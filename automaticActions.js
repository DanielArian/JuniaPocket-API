const db = require('./Database/index');
const notify = require('./notify');
const aurionScrapper = require('./AurionScrapperCore/index');
const axios = require('axios');


function getUTCDateNow(date) {
    /**
     * Converti une chaine au format 'jj/mm/aaaa' en UTC Date String.
     * Si la chaine donnée en argument est vide, on renvoie
     * la date du jour en UTC Date String initialisée à minuit.
     */
    // Conversion de la date en Date Object
    let jetlag = 2;
    let dateNow = new Date()
    let utcDateNow = Date.UTC(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours() + jetlag, dateNow.getUTCMinutes(), dateNow.getUTCSeconds())
    let utcDateObject = new Date(new Date(utcDateNow));
    return utcDateObject;
}


function getMinutesBetweenDates(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    return (diff / 60000);
}


function keepHerokuAlive() {
    /**
     * A pour but de lancer une requête inutile sur l'API pour
     * qu'elle ne se mette pas en veille sur Heroku.
     */
    console.log("## Keep-Alive request ##");
    axios
        .get('https://juniapocketapi.herokuapp.com/')
        .then(res => {
            console.log(`KeepAlive statusCode: ${res.statusCode}`);
        })
        .catch(error => {
            console.error(error);
            return false;
        })
}



async function updateMarks() {

    console.log('## MAJ AUTO DES NOTES ##');
    let listOfUserDoc;
    try {
        listOfUserDoc = await db.Models.User.find();
    } catch (error) {
        console.log(`updateMarks error --> ${error}`);
        return false;
    }

    // console.log('LIST :', listOfUserDoc)

    for (user of listOfUserDoc) {

        let aurionID = user.aurionID;
        let aurionPassword = user.aurionPassword;

        // On verifie que l'user a deja un document de notes
        // Sinon on ne fait rien

        let userMarkDoc = await db.manageMark.getStudentMarkDoc(aurionID)
        if (userMarkDoc != null && userMarkDoc != 'ERROR') {

            console.log(`Mise à jour des notes de ${userMarkDoc.aurionID}...`);

            // On récupère notes sur Aurion
            let updatedMarksOfUser;
            try {
                let marksPageContent = await aurionScrapper.fetch.marks(aurionID, aurionPassword);
                if (marksPageContent == 'Username ou mot de passe invalide.') {
                    console.log(`updateMarks --> Les identifiants aurions de ${aurionID} ne sont plus valides.`)
                }
                updatedMarksOfUser = aurionScrapper.formatMarks.getFormatedMarks(marksPageContent);
            } catch (error) {
                console.log(`updateMarks error --> Echec de la récupération des notes Aurion de ${aurionID} -->  ${error}`)
            }

            // On vérifie s'il y a au moins une nouvelle note

            let oldMarksDoc = await db.search.findUserByAurionIDInCollection(aurionID, db.Models.Mark);
            let listOfNewMarks = db.manageMark.getListOfNewMarks(oldMarksDoc.marks, updatedMarksOfUser);
            let nbOfNewMarks = listOfNewMarks.length;

            // Envoi notification si au moins une nouvelle note

            if (nbOfNewMarks > 0) {

                console.log(`Une nouvelle note pour ${aurionID} !`);

                // On génère le contenu de la notif
                let notifTitle = 'Nouvelle note !\n\n';
                if (nbOfNewMarks > 1) notifTitle = 'Nouvelles notes !\n';
                let notifContent = '';
                for (mark of listOfNewMarks) {
                    let keys = Object.keys(mark);
                    for (k of keys) {
                        notifContent += k + ': ' + mark[k] + '\n'
                    }
                    notifContent += '\n';
                }
                // envoi
                notify(aurionID, notifTitle, notifContent);
            }

            // On met a jour la database
            // On pourrait sauter cette étape en utilisant la condition (nbOfNewMarks == 0)

            try {
                db.manageMark.updateMarksInDoc(aurionID, updatedMarksOfUser);
            } catch (error) {
                console.log(`updateMarks error --> Echec sauvegarde des notes de ${aurionID} dans Marks --> ${error}`)
                return res.status(sCode.unauthorized).json({ error });
            }

        }
        else {
            console.log(`updateMarks --> ${aurionID} n'a pas notes déjà existantes. Pas de MAJ possible.`);
        }

    }
}


async function notifyNextCourse() {
    /**
     * NECESSITE QUE LE PLANNING SOIT DEJA ENREGISTRE DANS LA BDD
     * 
     */

    // Si on est un dimanche, on ne fait rien.
    let day = new Date().getDay()
    if (day == 0) {
        return true;
    }

    // Sinon, on récupère les planning des User ayant déjà sauv des planning

    let listOfPlanningDoc;
    try {
        listOfPlanningDoc = await db.Models.Planning.find();
    } catch (error) {
        console.log(`getMinutesUntilNextCourse error --> ${error}`);
        return false;
    }

    for (user of listOfPlanningDoc) {

        // On récupère le planning de la semaine

        let aurionID = user.aurionID;
        let date = '';   // on prend la date du jour
        let currentWeek = await db.managePlanning.findWeekPlanningFromDate(aurionID, date);

        // si la semaine est enregistrée dans la BDD pour l'user

        if (currentWeek != null) {

            // On récupère dans la BDD les cours du jour puis on cherche le prochain horaire

            let eventsOfTheDay = Object.values(currentWeek.days)[day - 1];
            let beginDate;

            for (e of eventsOfTheDay) {

                // On calcule le nb de minutes restantes avant l'event (peut être négatif)

                let [hour, min] = e.startTime.split(':');
                let date = new Date(e.date);
                beginDate = new Date(date.setTime(date.getTime() + hour * 60 * 60 * 1000 + min * 60 * 1000));
                let dateNow = getUTCDateNow();
                let diff = getMinutesBetweenDates(dateNow, beginDate)

                console.log('diff', diff / 60);

                // Si l'event n'est pas passé et qu'il se produit dans moins de 20 min

                if (diff > 0 && diff <= 20) {

                    // On génère le contenu de la notif
                    let notifTitle = `Prochain cours dans ${Math.floor(diff)} minutes !`;
                    let notifContent = `Salle: ${e.room}\nIntitulé: ${e.eventName}\nIntervenant: ${e.teacher}`;
                    // envoi
                    notify(aurionID, notifTitle, notifContent);
                }
            }
        }
    }
}

module.exports = {
    keepHerokuAlive,
    updateMarks,
    notifyNextCourse
}