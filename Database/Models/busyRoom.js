const mongoose = require('mongoose');

const UnavailableRoomSchema = mongoose.Schema({
    date: String,
    rooms: [Object]
});

module.exports = mongoose.model('Unavailable Room', UnavailableRoomSchema);