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


function updatePlanningDocument(studentAurionID, updatedMarkResponse) {

    try { 
        MarkModel.updateOne({aurionID: studentAurionID }, 
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