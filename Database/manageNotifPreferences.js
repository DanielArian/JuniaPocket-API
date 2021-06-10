const mongoose = require('mongoose');
const db = require('./index');
const save = require('./save');


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
    {collection: 'notificationPrefence'});
    db.save.saveDoc(doc);
}

module.exports = {
    saveEmptyNotifPreferencesDoc,
}