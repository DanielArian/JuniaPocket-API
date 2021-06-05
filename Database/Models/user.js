const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    aurionID: String,
    password: String,
    name: String
});

module.exports = mongoose.model('User', UserSchema);