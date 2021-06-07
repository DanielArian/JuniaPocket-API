const mongoose = require('mongoose');
const db = require('./index');

function createUserDocument (userAurionID, aurionPassword, hashedPassword, realName) {
    /**
     * @param {String} userAurionID - Identifiant aurion
     * @param {String} hashedPassword
     * @param {String} realName
     * @return {mongoose.Document} Document suivant le modele dans ./models/mark
     */

    const doc = new db.Models.User({
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


function saveUser (doc) {
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


async function getAurionPassword(aurionID) {
    let user;
    try {
        user = await db.search.findUserByAurionIDInCollection(aurionID, db.Models.User);
    } catch (error) {
        console.log(`getAurionPassword error --> ${error}`);
        return 'ERROR';
    }
    if (user == 'USER_DOES_NOT_EXIST_IN_COLLECTION' || user == 'ERROR') {
        let emptyString = '';
        return emptyString;
    }
    return user.aurionPassword;
}


module.exports = {
    createUserDocument,
    saveUser,
    getAurionPassword
}