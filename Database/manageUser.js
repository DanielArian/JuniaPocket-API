const mongoose = require('mongoose');
const UserModel = require('./Models/user');

exports.createUserDocument = (userAurionID, aurionPassword, hashedPassword, realName) => {
    /**
     * @param {String} userAurionID - Identifiant aurion
     * @param {String} hashedPassword
     * @param {String} realName
     * @return {mongoose.Document} Document suivant le modele dans ./models/mark
     */

    const doc = new UserModel({
        _id: new mongoose.Types.ObjectId(),
        name: realName,
        aurionID: userAurionID,
        aurionPassword: aurionPassword,
        jpocketPassword: hashedPassword
    },
    {collection: 'user'});
    console.log(`createUserDocument --> Création d'un document pour ${userAurionID} dans la collection "users".`)
    return doc;
}


exports.saveUser = (doc) => {
    doc.save((err, insertedDoc) => {
        if (err) {
            console.error(err, insertedDoc);
            return false;
        }
        // This will print inserted record from database
        console.log(`saveUser --> Sauvegarde d'un document User pour ${insertedDoc.aurionID} dans la collection "user".`);
        // console.log(insertedDoc)
        return true;
      });
}