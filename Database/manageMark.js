const mongoose = require('mongoose');
const db = require('./index');
const save = require('./save');
const MarkModel = require('./Models/mark');
const lodash = require('lodash');


function getUTCNowDate() {
    var jetlag = 2;
    var dateNow = new Date()
    var utcDateNow = new Date(Date.UTC(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours() + jetlag, dateNow.getUTCMinutes(), dateNow.getUTCSeconds()))
    return utcDateNow;
}

function createMarkDocument(studentAurionID, markResponse) {
    /**
     * @param {String} studentAurionID - Identifiant aurion
     * @param {Object} markResponse - Réponse de l'API AurionScrapper après demande de notes
     * @return {mongoose.Document} Document suivant le modele dans ./models/mark
     */

    const doc = new MarkModel({
        _id: new mongoose.Types.ObjectId(),
        aurionID: studentAurionID,
        lastUpdate: getUTCNowDate(),
        marks: markResponse
    },
        { collection: 'mark' });
    console.log(`Création d'un document pour ${studentAurionID} dans la collection "marks".`)
    return doc;
}


async function getStudentMarkDoc(studentAurionID) {
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
            const doc = MarkModel.findOne({ aurionID: studentAurionID });
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


async function getStudentMarks(studentAurionID) {
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


function updateMarksInDoc(studentAurionID, updatedMarkResponse) {

    MarkModel.updateOne({ aurionID: studentAurionID },
        {
            $set: {
                'lastUpdate': getUTCNowDate(),
                'marks': updatedMarkResponse
            }
        },
        function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                console.log("Original Doc : ", docs);
            }
        });
}

function getListOfNewMarks(oldMarks, updatedMarks) {
    /**
     * @param {Array} oldMarks - liste de notes qui étaient dans la BDD
     * @param {Array} updatedMarks - liste de notes récupérées par aurionScrapper
     * @return {Array} Liste vide si aucune nouvelle note, sinon une liste
     *              d'objets de notes
     */
    let newMarksFound = [];
    if (updatedMarks.length == oldMarks.length) {
        return newMarksFound;
    }
    for (var i = 0; i < updatedMarks.length; i++) {
        let n = 0;
        for (var j = 0; j < oldMarks.length; j++) {
            let isDiff = !lodash.isEqual(updatedMarks[i], oldMarks[j])
            if (isDiff) {
                n++;
            }
        }
        // si la note dans updatedMark n'est pas présente dans oldMarks
        if (n == oldMarks.length) {
            newMarksFound.push(updatedMarks[i])
        }
    }
    return newMarksFound;
}

module.exports = {
    createMarkDocument,
    getStudentMarkDoc,
    getStudentMarks,
    updateMarksInDoc,
    getListOfNewMarks
}