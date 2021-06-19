const db = require('../Database/index');
const sCode = require('../httpStatus');

var fs = require('fs');

exports.getAvailableRoomsByUserPreferences = async (req, res) => {

    /**
     * PENSER A AJOUTER MIDDLEWARE POUR CONTROLLER LES FORMATS
     * 
     * Renvoie les sales dispo en fonction de !
     *  - une date 
     *  - Début heure occupation (format :  'HH:MM') OPTIONNEL (par défaut : ''  à l'heure de la requête)
     *  - temps occupation (format : 'HH:MM') OPTIONNEL (par défaut : on renvoie les salles même si elles sont prises dans 5 min par ex)
     */

    let date = '07/06/2021'
    let beginTime = '13:30';
    let timeToSpendInRoom = '';

    // let beginTime = req.body.beginTime;
    // let usingTime = req.body.usingTime;

    let r = await db.manageRoom.getListOfAvailableRooms(date, beginTime, timeToSpendInRoom)

    console.log(r.length);

    fs = require('fs');
    fs.writeFile('test.js', JSON.stringify(r), function (err) {
        if (err) return console.log(err);
        console.log('file written!');
    });
}