const db = require('./index');

function isTimeInferior(timeA, timeB) {
    /**
     * Renvoie true    si timeA <= timeB
     *         false   sinon
     * 
     * timeA = 'HH:MM'
     */

    let timeAstr = timeA.split(':')[0] + timeA.split(':')[1];
    let timeBstr = timeB.split(':')[0] + timeB.split(':')[1];
    if (Number(timeAstr) <= Number(timeBstr)) {return true}
    else return false;
}

async function getListOfAvailableRooms(date, beginTime, usingTime) {
    /**
     * return [room label]
     */

    date = db.managePlanning.convertDateStringToUTCDate(date).toString();

    // Si l'heure de début n'est pas renseignée, on prends l'heure de la requête
    if (beginTime == '') {
        let dateNow = new Date();
        let jetlag = 2;
        beginTime = `${dateNow.getHours() + jetlag}:${dateNow.getUTCMinutes()}`;
    }

    // On récupère la liste des salles
    let listAllRoomsDoc = await db.Models.Room.find();

    // On récup le document contenant la liste des salles pour la date demandée
    let unavailableRoomDoc = await db.Models.UnavailableRoom.findOne({ date: date });

    let availableRooms = [];

    for (roomObj of listAllRoomsDoc) {

        if (Object.keys(unavailableRoomDoc.rooms).includes(roomObj.label)) {
            let usedSlotForRoom = unavailableRoomDoc.rooms[roomObj.label]

            for (unavailableSlot of usedSlotForRoom) {

                let beginTimeOfUnavailableSlot = unavailableSlot[0];
                let endTimeOfUnavailableSlot = unavailableSlot[0];

                if (isTimeInferior(beginTime, beginTimeOfUnavailableSlot)) {

                }
                if ("(isTimeInferior(beginTimeOfUnavailableSlot, beginTime) && "isTimeInferior(beginTime, endTimeOfUnavailableSlot))) {

                }
            }
        }
        else {
            let obj = { label: roomObj.label, timeLimit: null }
            availableRooms.push(obj);
        }
    }
}

module.exports = {
    getListOfAvailableRooms
}

console.log(isTimeInferior('08:00', '07:59'))
console.log(isTimeInferior('08:00', '08:00'))
console.log(isTimeInferior('08:00', '22:59'))