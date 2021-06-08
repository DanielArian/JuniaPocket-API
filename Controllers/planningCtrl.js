const config = require('../Config/index');
const sCode = require('../httpStatus');

const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');


exports.getPlanningOfWeek = async (req, res) => {

    let aurionID = req.user.aurionID;
    console.log('Inside : getPlanningOfWeek');
    // On vérifie si l'user a déjà un document Planning
    // Si oui, on renvoie le planning pour la semaine demandée
    // Si non, on récupère le planning de la semaine demandée sur Aurion
    // on les stocke dans notre BDD puis on renvoie la planning

    
}