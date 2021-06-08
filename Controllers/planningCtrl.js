const config = require('../Config/index');
const sCode = require('../httpStatus');

const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');
const { getAurionPassword } = require('../Database/manageUser');


exports.getPlanningOfWeek = async (req, res) => {
    
    let aurionID = req.user.aurionID;   // assuré par le middleware auth.js
    let date = req.body.date;       // assuré par le middleware requireWeekDate.js

    // On récupère les éventuelles semaines sauvegardées dans la bdd par l'user
    let availableWeeks = await db.managePlanning.getWeeks(aurionID, db.Models.Planning);

    // Si des semaines sont déjà sauv dans la Database, on cherche si la date de la semaine
    // demandée est déjà comprise dans une de ces semaines.

    if (availableWeeks.length > 0) {
        let week = await db.managePlanning.findWeekPlanningFromDate(aurionID, date);

        // Si la semaine demandée est déjà sauvegardée dans la Database
        if (week != null) {
            return res.status(sCode.OK).send(JSON.stringify(week));
        }
    }

    // Sinon, on récupère sur Aurion et on rajoute la semaine demandée dans la database

    // Récupération Planning sur Aurion
    console.log(`Récupération du planning de ${aurionID} dans la semaine du ${date}`);
    let requestedWeek;
    try {
        let aurionPassword = await getAurionPassword(aurionID);
        console.log(`Connexion de ${aurionID} à Aurion...`);
        let planningPage = await aurionScrapper.fetch.planning(aurionID, aurionPassword, date);
        requestedWeek = aurionScrapper.formatPlanning.responseWeekPlanning(planningPage);
    } catch (error) {
        console.log(`getPlanningOfWeek error --> Echec récupération planning aurion de ${aurionID} dans la semaine du ${date}`);
        return res.status(sCode.serverError).json({ error });
    }

    // Ajout dans la Database de la semaine récup
    try {
        if (availableWeeks.length == 0) {
            const doc = db.managePlanning.createPlanningDocument(aurionID, requestedWeek);
            db.save.saveDoc(doc);
        }
        else {
            db.managePlanning.addWeekToPlanningDoc(aurionID, requestedWeek);
        }
        return res.status(sCode.OK).send(JSON.stringify(requestedWeek));
    } catch (error) {
        console.log(`getPlanningOfWeek error --> Echec sauvegarde planning aurion de ${aurionID} dans la semaine du ${date}`);
        return res.status(sCode.serverError).json({ error });
    }
}