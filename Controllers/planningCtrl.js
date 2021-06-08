const config = require('../Config/index');
const sCode = require('../httpStatus');

const db = require('../Database/index');
const aurionScrapper = require('../AurionScrapperCore/index');
const { getAurionPassword } = require('../Database/manageUser');


exports.getPlanningOfWeek = async (req, res) => {
    /**
     * On vérifie si l'user a déjà un document Planning
     * Si oui :
     *      1) On vérifie si la semaine demandée est déjà la BDD
     *      2) Si non, on la récupère sur aurion, on l'enregistre et on la renvoie
     * Si non:
     *      1) On récupère la semaine demandée sur aurion, on l'enregistre et on renvoie.
     */

    let aurionID = req.user.aurionID;   // assuré par le middleware auth.js
    let date = req.body.date;       // assuré par le middleware requireWeekDate.js
    
    // On vérifie sur l'user a déjà au moins une semaine sauvegardée dans la bdd
    let availableWeeks = await db.managePlanning.getWeeks(aurionID, db.Models.Planning);
    console.log(availableWeeks);
    
    // Si aucune donnée dans la Database, on y rajoute la semaine demandée
    if (Weeks.length == 0) {

        // Récupération Planning semaine sur Aurion
        let requestedWeek;
        try {
            let aurionPassword = await getAurionPassword(aurionID);
            let planningPage = await aurionScrapper.fetch.planning(aurionID, aurionPassword, date);
            requestedWeek = aurionScrapper.formatPlanning.responseWeekPlanning(planningPage);
        } catch (error) {
            console.log(`getPlanningOfWeek error --> Echec récupération planning aurion de ${aurionID} dans la semaine du ${date}`);
            return res.status(sCode.serverError).json({error});
        }

        // Ajout dans la Databas

    }

}