const mongoose = require('mongoose');
const UserModel = require('./Models/user');

exports.createUserDocument =  function (studentAurionID, hashedPassword, studentName) {
    /**
     * @param {String} studentAurionID - Identifiant aurion
     * @param {Object} markResponse - Réponse de l'API AurionScrapper après demande de notes
     * @return {mongoose.Document} Document suivant le modele dans ./models/mark
     */

    const doc = new UserModel({
        _id: new mongoose.Types.ObjectId(),
        aurionID: studentAurionID,
        password: hashedPassword,
        name: studentName
    },
    {collection: 'user'});
    console.log(`Création d'un document pour ${studentAurionID} dans la collection "users".`)
    return doc;
}


exports.saveUser = function (doc) {
    doc.save((err, insertedDoc) => {
        if (err) {
            console.error(err, insertedDoc);
            return false;
        }
        // This will print inserted record from database
        console.log(`Sauvegarde d'un document User pour ${insertedDoc.aurionID} dans la collection "marks".`);
        // console.log(insertedDoc)
        return true;
      });
}

