const mongoose = require('mongoose');
const db = require('./index');
const PlanningModel = require('./Models/planning');
const lodash = require('lodash');


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
        let dateNow = new Date()
        let utcDateNow = Date.UTC(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours() + jetlag, dateNow.getUTCMinutes(), dateNow.getUTCSeconds())
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
     */

    // On recherche la date du lundi de la semaine de la date donnée car on va
    // effectuer une recherche dans la bdd en fonction de la key beginDate

    let utcDate = convertDateStringToUTCDate(date);
    while (utcDate.getDay() != 1) { // On se ramène à un lundi (1), sachant que dimanche = 0
        utcDate.setDate(utcDate.getDate() - 1);
    }
    let utcDateStringWithoutTime = utcDate.toUTCString().split(' 00:')[0];

    // Dans la liste weeks, on met à jour la liste days de la semaine à update
    try {
        return PlanningModel.updateMany({
            aurionID: aurionID,
            'weeks.beginDate': utcDateStringWithoutTime
        },
            {
                $set: {
                    'weeks.$': updatedWeek
                }
            },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Original Doc : ", docs);
                }
            });
    } catch (error) {
        console.log(error);
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


async function findWeekPlanningFromDate(aurionID, date) {
    /**
     * Recherche dans la database parmi les semaines enregistrés d'un user 
     * celle qui contient la date donnée en argument (au format 'jj/mm/yyyy').
     * Si l'argument date est une chaine vide, on considère que la date
     * est la date du jour.
     * 
     * Renvoie l'Object de l'array 'weeks' qui contient cette date
     * Si cette date n'est présente dans aucune semaine sauvegardée,
     * renvoie null.
     * 
     * 
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


function getListOfModifiedDays(oldWeek, updatedWeek) {
    /**
     * @param {Array} oldWeek - week stockée dans la BDD
     * @param {Array} updatedWeek - week récupérée et formatée par aurion Scrapper
     * @return {Array} Liste vide si pas de changement, sinon liste des date dans la semaine où il y a un chgmt
     */

    console.log('OLD: ', oldWeek);
    console.log('UP: ', updatedWeek)
    let listOfModifiedDays = [];
    let datesOfTheWeek = Object.keys(oldWeek.days);
    for (date of datesOfTheWeek) {
        let isDiff = !lodash.isEqual(oldWeek.days[date], updatedWeek.days[date])
        console.log(date, isDiff);
        if (isDiff) {
            listOfModifiedDays.push(date.split(' 00:')[0]);
        }
    }
    return listOfModifiedDays;
}

function addZeroBefore(n) {
    /**
     * Si un seul chiffre, rajoute un zéro devant
     *  2 --> 02
     *  03 --> 03
     *  22 --> 22
     */
    return (n < 10 ? '0' : '') + n;
}

function intersection(slotsA, slotsB) {
    /**
     * Trouve l'intersection de deux listes de créneaux.
     * Par exemple: 
     * slotsA = [[8, 12], [17, 22]]
     * slotsB = [[5, 11], [14, 18], [20, 23]]
     * output = [[8, 11], [17, 18], [20, 22]]
     * 
     * @param {Array} slotsA
     * @param {Array} slotsB
     */

    const targetSlot = (slotsA.length >= slotsB.lengh ? slotsA : slotsB);
    const restSlot = (targetSlot == slotsA ? slotsB : slotsA);
    const foundItersections = targetSlot.map(tu=> { 
       const mwminmax = restSlot.map(ru => {
            const startMax = (tu[0]>=ru[0] ? tu[0] : ru[0])
            const endMin =(tu[1]<=ru[1] ? tu[1] : ru[1])
            if(startMax<endMin){
                const retarr = [].concat(startMax,endMin)
                return retarr;
            }
            else return;
        })
        const filteredmwminmax = mwminmax.filter(x=>x!==undefined)
        return filteredmwminmax; 
    })
    return lodash.flatten(foundItersections);
}


function getSeconds(timeHHMM) {
    /**
     * @param {Number} timeHHMM - 'HH:MM'
     * 
     * Renvoie le nombre de secondes écoulées depuis minuit.
     */

    return Number(timeHHMM.split(':')[0] * 3600 + timeHHMM.split(':')[1] * 60);
}


function getTime(seconds) {
    /**
     * @param {Number} seconds 
     * Renvoie l'heure en fonction du nombre de secondes écoulées depuis munuit du même jour
     */
    let hour = Math.floor(seconds / 3600);
    let min = (seconds % 3600) / 60;
    return `${addZeroBefore(hour)}:${addZeroBefore(min)}`;
}


function convertListOfTimeSlotsToSeconds(listTimeSlots) {
    /**
     * entrée = [[ '12:00', '13:30' ], [ '17:30', '21:00' ]]
     * sortie : [[ 43200, 48600 ], [ 36000, 75600 ]]
     */

    convertedSlots = []
    listTimeSlots.forEach(slot => {
        convertedSlots.push([getSeconds(slot[0]), getSeconds(slot[1])])
    })
    return convertedSlots;
}


function undoListOfTimesSlotsConversionToSeconds(listTimeSlots) {

    convertedSlots = []
    listTimeSlots.forEach(slot => {
        convertedSlots.push([getTime(slot[0]), getTime(slot[1])])
    })
    return convertedSlots;
}


async function getCommonAvailableTimeSlots(listOfAurionID, date) {

    // get available time slots for each user
    let userPlanning;
    let daySlot = [[getSeconds('00:00'), getSeconds('23:59')]];
    let userSlotsForTheWeek = [];   // available Time Slots
    for (aurionID of listOfAurionID) {
        userPlanning = await db.managePlanning.findWeekPlanningFromDate(aurionID, date);
        let daysEvent = Object.values(userPlanning.days);
        let availableSlotsByDay = [];
        for (day of daysEvent) {
            let usedTimeSlots = []
            day.forEach(event => {
                usedTimeSlots.push([event.startTime, event.endTime])
            })
            let availableSlots = db.manageRoom.getListAvailableSlots(usedTimeSlots);
            availableSlotsByDay.push(availableSlots);
        }
        userSlotsForTheWeek.push(availableSlotsByDay);
    }
    // intersect planning
    let availableAllDay = [[getSeconds('00:00'), getSeconds('23:59')]];
    let commonAvailabilityForWeekInSeconds = [availableAllDay, availableAllDay, availableAllDay, availableAllDay, availableAllDay, availableAllDay]

    for (let dayNb = 0; dayNb < 6; dayNb++) {
        for (userSlots of userSlotsForTheWeek) {

            let userSlotsOfDayInSeconds = convertListOfTimeSlotsToSeconds(userSlots[dayNb]);
            commonAvailabilityForWeekInSeconds[dayNb] = intersection(commonAvailabilityForWeekInSeconds[dayNb], userSlotsOfDayInSeconds)
        }
    }
    // generate response object
    let listofDaysDate = Object.keys(userPlanning.days);
    let obj = {};
    for (let dayNb = 0; dayNb < 6; dayNb++) {
        obj[listofDaysDate[dayNb]] = undoListOfTimesSlotsConversionToSeconds(commonAvailabilityForWeekInSeconds[dayNb]);
    }

    return obj;
}


module.exports = {
    convertDateStringToUTCDate,
    createPlanningDocument,
    updateWeek,
    getWeeks,
    addWeekToPlanningDoc,
    findWeekPlanningFromDate,
    getListOfModifiedDays,
    getCommonAvailableTimeSlots
}