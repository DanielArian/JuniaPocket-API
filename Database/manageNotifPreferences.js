const mongoose = require('mongoose');
const db = require('./index');
const { findOneAndUpdate } = require('./Models/notifPreferences');


function saveEmptyNotifPreferencesDoc(aurionID) {
    /**
     * Cette fonction est seulement appelée à l'inscription de l'user
     */
    const doc = new db.Models.NotifPreferences({
        _id: new mongoose.Types.ObjectId(),
        aurionID: aurionID,
        messengerPSID: '',
        mail: ''
    },
        { collection: 'notificationPrefence' });
    db.save.saveDoc(doc);
}


function setPreferences(aurionID, PSID, mail) {
/**
 * Return bool
 */
    try {
        db.Models.NotifPreferences.findOneAndUpdate({ aurionID: aurionID },
            {
                $set: {
                    messengerPSID: PSID,
                    mail: mail
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
        return true;
    } catch (error) {
        console.log(`setNotifPreferences error --> ${error}`);
        return false;
    }
}

module.exports = {
    saveEmptyNotifPreferencesDoc,
    setPreferences
}