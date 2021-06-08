const mongoose = require('mongoose');
const PlanningModel = require('./Models/planning');

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
    {collection: 'planning'});
    return doc;
}


function updatePlanningDocument(aurionID, updatedMarkResponse) {

    try {
        MarkModel.updateOne({aurionID: aurionID }, 
        {$set: {
            'weeks': updatedMarkResponse
        }},
        function (err, docs) {
            if (err){
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


async function getWeeks (studentAurionID) {
    /**
     * 
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

module.exports = {
    createPlanningDocument,
    updatePlanningDocument,
    getWeeks
}