const db = require('./index');

function getListAvailableSlots(listOfUsedSlots) {
    /**
     * On donne en argument la liste des créneaux utilisés pour une salle
     * et renvoie les créneaux libres pour cette salle (cf. exemple)
     * On considère qu'une journée commence à 8h et finie à 21h.
     * 
     * Exemple :
     * Entrée : [ [08:00, 10:00], [14:35, 15:30] ]
     * Sortie : [ [00:00, 08:00], [10:00, 14:35], [15:30, 21:00] ]
     */

    let availableSlotsString = '08:00-';
    for (unavailableSlot of listOfUsedSlots) {
        availableSlotsString += `${unavailableSlot[0]}X${unavailableSlot[1]}-`
    }
    availableSlotsString += '21:00';

    let availableSlots = []

    for (slot of availableSlotsString.split('X')) {
        availableSlots.push(slot.split('-'));
    }
    console.log()
    return availableSlots;
}


function isTimeInferior(timeA, timeB) {
    /**
     * Renvoie true    si timeA <= timeB
     *         false   sinon
     * 
     * timeA = 'HH:MM'
     */

    let timeAstr = timeA.split(':')[0] + timeA.split(':')[1];
    let timeBstr = timeB.split(':')[0] + timeB.split(':')[1];
    if (Number(timeAstr) <= Number(timeBstr)) { return true }
    else return false;
}

function addZeroBefore(n) {
    return (n < 10 ? '0' : '') + n;
}


function getSeconds(timeHHMM) {
    /**
     * @param {Number} timeHHMM - 'HH:MM'
     * 
     * Renvoie le nombre de secondes écoulées depuis minuit.
     */

    return Number(timeHHMM.split(':')[0] * 3600 + timeHHMM.split(':')[1] * 60);
}


function isRoomAvailableLongEnough(beginTime, timeToSpendInRoom, endOfAvailabilityTime) {
    /**
     * @param {String} beginTime - 'HH:MM'
     * @param {String} timeToSpendInRoom - 'HH:MM'
     * @param {String} endOfAvailabilityTime - 'HH:MM'
     */

    secondsBeginTime = getSeconds(beginTime);
    secondsTimeToSpend = getSeconds(timeToSpendInRoom);
    secondsEndOfAvailabilityTime = getSeconds(endOfAvailabilityTime);

    let isAvailableLongEnough = (secondsBeginTime + secondsTimeToSpend) <= secondsEndOfAvailabilityTime;

    return isAvailableLongEnough;
}


async function getListOfAvailableRooms(date, beginTime, timeToSpendInRoom) {
    /**
     * date = 'jj/mm/aaaa' (si '' => date actuelle)
     * beginTime = 'HH:MM' (si '' =>  heure de la requête)
     * timeToSpendInRoom = 'HH:MM' (durée) (si '' => prends pas en compte ce critère)
     * return [list of object] si des room sont dispo, return [] sinon
     */

    date = db.managePlanning.convertDateStringToUTCDate(date).toUTCString();

    // Si l'heure de début n'est pas renseignée, on prends l'heure de la requête
    if (beginTime == '') {
        let dateNow = new Date();
        let jetlag = 2;
        beginTime = `${dateNow.getUTCHours() + jetlag}:${addZeroBefore(dateNow.getUTCMinutes())}`;
    }

    // Si on est pas entre 7h et 21h, pas de salle dispo
    let beginHour = Number(beginTime.split(':')[0]);
    console.log('hour:', beginHour)
    if (beginHour < 8 || beginHour >= 21) {
        return [];
    }

    // On récupère la liste des salles
    let listAllRoomsDoc = await db.Models.Room.find();

    // On récup le document contenant la liste des salles pour la date demandée
    let unavailableRoomDoc = await db.Models.UnavailableRoom.findOne({ date: date });
    if (!unavailableRoomDoc) {
        // no data found
        return [];
    }

    let availableRooms = [];

    for (roomObj of listAllRoomsDoc) {

        // Si une salle est au moins une fois occupée dans la journée
        if (Object.keys(unavailableRoomDoc.rooms).includes(roomObj.label)) {

            // On récupère les créneaux qui sont libres

            let unavailableSlots = unavailableRoomDoc.rooms[roomObj.label];
            let availableSlots = getListAvailableSlots(unavailableSlots);

            // Pour chaque créneau libre, on cherche celui qui vérifie la demande
            // en horaire et/ou temps d'ulisation

            for (slot of availableSlots) {

                let [slotBeginTime, slotEndTime] = slot;

                if (isTimeInferior(slotBeginTime, beginTime) && isTimeInferior(beginTime, slotEndTime)) {

                    if (timeToSpendInRoom == '') { // si temps d'utilisation dérisiré non précisé
                        let obj = { label: roomObj.label, timeLimit: slotEndTime != '21:00' ? slotEndTime : null };
                        availableRooms.push(obj);
                    }
                    else { // SI timeToSpend précisé

                        let isAvailableLongEnough = isRoomAvailableLongEnough(slotBeginTime, timeToSpendInRoom, slotEndTime);

                        if (isAvailableLongEnough) {
                            let obj = { label: roomObj.label, timeLimit: slotEndTime != '21:00' ? slotEndTime : null };
                            availableRooms.push(obj);
                            break;
                        }
                    }
                }
            }
        }
        else {
            let obj = { label: roomObj.label, timeLimit: null };
            availableRooms.push(obj);
        }
    }
    return availableRooms;
}

module.exports = {
    getListOfAvailableRooms
}

// // TEST UNIT
// console.log(isTimeInferior('08:00', '07:59'))
// console.log(isTimeInferior('08:00', '08:00'))
// console.log(isTimeInferior('08:00', '22:59'))
// console.log(getListAvailableSlots([ ['08:00', '10:00'], ['14:35', '15:30'] ]))