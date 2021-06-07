const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: String,
    aurionID: String,
    aurionPassword: String,
    jpocketPassword: String
});

module.exports = mongoose.model('User', UserSchema);