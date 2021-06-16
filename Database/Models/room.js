const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    code: String,
    label: String,
    location: String
});

module.exports = mongoose.model('Room', RoomSchema);