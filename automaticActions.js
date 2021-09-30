const db = require('./Database/index');
const notify = require('./notify');
const aurionScrapper = require('./AurionScrapperCore/index');
const axios = require('axios');
const mongoose = require('mongoose');
const crypt = require('./crypt');

const { forEach } = require('lodash');

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
        let aurionPassword = crypt.decode(user.aurionPassword);

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


async function updatePlanning () {

    console.log('## MAJ AUTO DES PLANNING ##');
    let listOfUserDoc;
    try {
        listOfUserDoc = await db.Models.User.find();
    } catch (error) {
        console.log(`updatePlanning error --> ${error}`);
        return false;
    }
    let date = ''

    // console.log('LIST :', listOfUserDoc)

    for (user of listOfUserDoc) {

        let aurionID = user.aurionID;
        let aurionPassword = crypt.decode(user.aurionPassword);

        console.log(`Mise à jour planning semaine de ${aurionID}`);

        // On verifie que l'user a deja un planning de sauvegardé pour la semaine actuelle
        // Sinon on ne fait rien

        let weekToUpdate = await db.managePlanning.findWeekPlanningFromDate(aurionID, date);

        if (weekToUpdate != null && weekToUpdate != 'ERROR') {

            // Récupération sur Aurion du Planning Semaine demandée 
            console.log(`Récupération du planning de ${aurionID} dans la semaine actuelle`);
            let requestedWeek;
            try {
                let planningPage = await aurionScrapper.fetch.planning(aurionID, aurionPassword, date);
                if (planningPage == 'Username ou mot de passe invalide.') {
                    console.log('IDENTIFIANTS_AURION_MODIFIES');
                }
                requestedWeek = await aurionScrapper.formatPlanning.responseWeekPlanning(planningPage);
            } catch (error) {
                console.log(`updatePlanning error --> Echec récupération planning aurion de ${aurionID} dans la semaine actuelle`);
            }

            // On vérifie s'il y a eu des modification d'emploi du temps
            let listOfModifiedDays = db.managePlanning.getListOfModifiedDays(weekToUpdate, requestedWeek);

            console.log('listOfModifiedDays:', listOfModifiedDays);

            // S'il y a modification et que mise à jour automatique
            // on envoie une notification à l'utilisateur
            if (listOfModifiedDays.length > 0 ) {
                // Génération contenu de la notif
                let notifTitle = `Modifications Planning détectées : ${listOfModifiedDays[0]}`;
                let notifContent = ``;
                if (listOfModifiedDays.length > 1) {
                    notifTitle = `Modifications Planning détectées aux dates suivantes :`;
                    for (dateDay of listOfModifiedDays) {
                        notifContent += dateDay + '\n';
                    }
                }
                // Envoi de la notif
                notify(aurionID, notifTitle, notifContent);
            }
            else {
                console.log(`updatePlanning --> Pas de modifications de planning dans la semaine actuelle`);
            }

            // Mise à jour dans la BDD de la semaine demandée
            try {
                await db.managePlanning.updateWeek(aurionID, date, requestedWeek);
            } catch (error) {
                console.log(error);
            }
        }
    }
}


async function updateUnavailableRooms() {

    console.log('< updateUnavailableRooms >');

    let listOfPlanningDoc;
    try {
        listOfPlanningDoc = await db.Models.Planning.find();
        listOfRoomDoc = await db.Models.Room.find();
    } catch (error) {
        console.log(`updateMarks error --> ${error}`);
        return false;
    }


    for (planningDoc of listOfPlanningDoc) {
        for (Week of planningDoc.weeks) {
            for (day of Object.keys(Week.days)) {
                for (evenement of Week.days[day]) {
                    for (roomDoc of listOfRoomDoc) {

                        if (evenement.room.includes(roomDoc.label)) {

                            console.log(`${planningDoc.aurionID} / ${day} :  ${roomDoc.label}`);

                            // On verif si date déjà existante dans la collection Unavailable Rooms

                            try {
                                let UnavailableRoomDoc = await db.Models.UnavailableRoom.findOne({ date: day });

                                // Si non existante

                                if (!UnavailableRoomDoc) {
                                    // No data found / On créée et sauvegarde la date
                                    var label = roomDoc.label;
                                    let [startTime, endTime] = [evenement.startTime, evenement.endTime];
                                    let obj = {};
                                    obj[label] = [[startTime, endTime]];

                                    const doc = db.Models.UnavailableRoom({
                                        _id: new mongoose.Types.ObjectId(),
                                        date: day,
                                        rooms: obj
                                    }, { collection: 'unavailableRoom' });

                                    // sauvegarde mais empeche de passer à la suite tant que non fini
                                    await doc.save().then(console.log('first save!'));

                                    break;
                                }
                                // Si date existante dans la collection Unavailable Rooms
                                else {

                                    // On verif si la salle est déjà existante ou non
                                    let isRoomAlreadyThere = Object.keys(UnavailableRoomDoc.rooms).includes(roomDoc.label);

                                    if (isRoomAlreadyThere) {

                                        // On vérifie si le(s) créneau(x) renseingné(s) pour cette salle ne sont pas déjà inscrits comme non dispo
                                        // On compare les heures de début uniquement (en supposant que les conflits ont déjà été traités par Aurion)

                                        let isNew = true;
                                        UnavailableRoomDoc.rooms[roomDoc.label].forEach((slot) => {

                                            console.log('Already taken slot :', slot);
                                            if (slot[0] == evenement.startTime) {
                                                isNew = false;
                                            }
                                        });

                                        // Si nouveau créneau, on l'ajoute et on save
                                        if (isNew) {
                                            let Slot = [evenement.startTime, evenement.endTime]
                                            UnavailableRoomDoc.rooms[roomDoc.label].push(Slot);
                                            // on trie les creneaux par horaires
                                            UnavailableRoomDoc.rooms[roomDoc.label].sort((a, b) => {
                                                let strStartTimeA = a[0].split(':')[0] + a[0].split(':')[1];
                                                let strStartTimeB = b[0].split(':')[0] + b[0].split(':')[1];
                                                return Number(strStartTimeA) - Number(strStartTimeB);
                                            })

                                            var pushObj = {};
                                            pushObj['rooms.' + label] = [evenement.startTime, evenement.endTime];
                                            db.Models.UnavailableRoom.updateOne({ date: day }, { $push: pushObj }).then(console.log('updated!'));
                                            break;
                                        }
                                    }
                                    else { // Si la salle n'existe pas encore à cette date on la rajoute

                                        var label = roomDoc.label;
                                        let [startTime, endTime] = [evenement.startTime, evenement.endTime];
                                        let obj = {};
                                        obj[label] = [[startTime, endTime]];

                                        db.Models.UnavailableRoom.updateOne({ date: day }, { $push: obj }).then(console.log('room added to date!'));
                                    }
                                }
                            } catch (error) {
                                console.log(`updateUnavailableRooms error --> ${error}`);
                            }
                        }
                    }
                }
            }
        }
    }
}


async function notifyNextCourse() {
    /**
     * NECESSITE QUE LE PLANNING SOIT DEJA ENREGISTRE DANS LA BDD
     * 
     */

    console.log('## CHECK NOTIF PROCHAIN COURS ##');

    // Si on est un dimanche, on ne fait rien.
    let day = new Date().getDay()
    if (day == 0) {
        return true;
    }

    // Si on est entre 22h et 7h on ne fait rien
    let hour = new Date().getHours()
    if (hour > 22 && hour < 7) {
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
    updatePlanning,
    updateUnavailableRooms,
    notifyNextCourse
}

