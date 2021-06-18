const db = require('./index');
const sCode = require('../httpStatus');

exports.getAvailableRoomsByUserPreferences = async (req, res) => {

    /**
     * PENSER A AJOUTER MIDDLEWARE POUR CONTROLLER LES FORMATS
     * 
     * Renvoie les sales dispo en fonction de !
     *  - une date 
     *  - Début heure occupation (format :  'HH:MM') OPTIONNEL (par défaut : à l'heure de la requête)
     *  - temps occupation (format : 'HH:MM') OPTIONNEL (par défaut : on renvoie les salles même si elles sont prises dans 5 min par ex)
     */

    let beginTime = req.body.beginTime;
    let usingTime = req.body.usingTime;

}