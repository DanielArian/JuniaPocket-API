const mongoose = require('mongoose');

const NotificationPreferenceSchema = mongoose.Schema({
    aurionID: String,
    messengerPSID: String,
    mail: String
});

module.exports = mongoose.model('Notification Preferences', NotificationPreferenceSchema);