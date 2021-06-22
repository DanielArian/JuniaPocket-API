const db = require('../Database/index');
const sCode = require('../httpStatus');
const mongoose = require('mongoose');

exports.getAvailableRoomsByUserPreferences = async (req, res) => {

    /**
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

exports.sendUserFavoritesToDatabase = async function (req, res) {

    let aurionID = req.user.aurionID;
    
    res.set('Content-Type', 'application/json');
    var doc = await db.Models.FavoriteRoom.findOne({ aurionID: aurionID });
    if (doc == null) {
        const docCreate = new db.Models.FavoriteRoom({
            _id: new mongoose.Types.ObjectId(),
            aurionID: aurionID,
            list: req.body.list,
        },
            { collection: 'favoriteroom' });
        doc = docCreate
    } else {
        doc.list = req.body.list;
    }

    doc.save(function (err, doc) {
        if (err) return console.error(err);
    });
    res.status(200).send("Ajout Ã  la bdd ok");
}


exports.getUserFavoriteRoom  = async function (req, res) {
    
    let aurionID = req.user.aurionID;

    res.set('Content-Type', 'application/json');
    const liste = await db.Models.FavoriteRoom.find({ aurionID: aurionID}).exec();
    // console.log(liste)
    res.status(200).send(liste);
  }