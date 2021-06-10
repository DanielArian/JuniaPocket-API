const mongoose = require('mongoose');

const NotifySchema = mongoose.Schema({
    aurionID: String,
    messengerPSID: String,
    mail: String
});

module.exports = mongoose.model('NotifInformation', NotifySchema);