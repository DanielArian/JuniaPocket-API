const db = require('../Database/index');
const sCode = require('../httpStatus');

exports.getAvailableRoomsByUserPreferences = async (req, res) => {

    /**
     * PENSER A AJOUTER MIDDLEWARE POUR CONTROLLER LES FORMATS
     * 
     * Renvoie les sales dispo en fonction de !
     *  - une date 
     *  - Début heure occupation (format :  'HH:MM') ('' = par défait,  à l'heure de la requête)
     *  - temps occupation (format : 'HH:MM') (si '' = par défaut : on renvoie les salles même si elles sont prises dans 5 min par ex)
     */

    let date = req.body.date;
    let beginTime = req.body.beginTime;
    let timeToSpendInRoom = req.body.timeToSpendInRoom;

    try {
        let r = await db.manageRoom.getListOfAvailableRooms(date, beginTime, timeToSpendInRoom);
        return res.status(sCode.OK).send(JSON.stringify(r));
    } catch (error) {
        console.log(`getAvailableRoomsByUserPreferences error --> ^${error}`);
        return res.status(sCode.serverError).json({ error });
    }
}