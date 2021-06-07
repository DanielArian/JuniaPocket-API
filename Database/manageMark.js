const mongoose = require('mongoose');
const MarkModel = require('./Models/mark');

function createMarkDocument (studentAurionID, markResponse) {
    /**
     * @param {String} studentAurionID - Identifiant aurion
     * @param {Object} markResponse - Réponse de l'API AurionScrapper après demande de notes
     * @return {mongoose.Document} Document suivant le modele dans ./models/mark
     */

    const doc = new MarkModel({
        _id: new mongoose.Types.ObjectId(),
        aurionID: studentAurionID,
        marks: markResponse
    },
    {collection: 'mark'});
    console.log(`Création d'un document pour ${studentAurionID} dans la collection "marks".`)
    return doc;
}


function saveMarkDocument (doc) {
    doc.save((err, insertedDoc) => {
        if (err) {
            console.error(err, insertedDoc);
            return false;
        }
        // This will print inserted record from database
        console.log("Document ajoute avec succes !");
        // console.log(insertedDoc)
        return true;
      });
}


async function getStudentMarkDoc (studentAurionID) {
    /**
     * @param {String} studentAurionID
     * @return {Object} Renvoie :
     *                  - le document de notes correspond à studentAurionID
     *                  - null si document non trouvé
     *                  - 'ERROR' si une erreur s'est produite
     * 
     * Rappel d'utilisation : To use await, its executing context needs to be async in nature
     */

    return new Promise((resolve, reject) => {
        try {
            const doc = MarkModel.findOne({aurionID: studentAurionID});
            if (doc == null) {
                console.log(`L\'étudiant ${aurionID} n'est PAS présent dans la collection "marks".`)
            }
            console.log(`Document de notes de l'étudiant ${studentAurionID} récupéré dans la collection "marks".`)
            resolve(doc);
        } catch (error) {
            console.log(`getStudentMarkDoc error --> ${error}`);
            reject('ERROR');
        }
    });
}


async function getStudentMarks (studentAurionID) {
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
        let doc = await getStudentMarkDoc(studentAurionID);
        if (doc == null) return [];
        if (doc == 'ERROR') return 'ERROR';
        else return doc.marks;
    } catch (error) {
        console.log(`getStudentMarks error --> ${error}`);
        return 'ERROR';
    }
}


function updateMarksInDoc (studentAurionID, updatedMarkResponse) {

    MarkModel.updateOne({aurionID: studentAurionID }, 
        {$set: {
            'marks': updatedMarkResponse
        }},
        function (err, docs) {
            if (err){
                console.log(err)
            }
            else {
                console.log("Original Doc : ", docs);
            }
        });
}


module.exports = {
    createMarkDocument,
    saveMarkDocument,
    getStudentMarkDoc,
    getStudentMarks,
    updateMarksInDoc
}