const mongoose = require('mongoose');

const FavoriteRoomSchem = mongoose.Schema({
    aurionID: String,
    list: [String]
});

module.exports = mongoose.model('FavoriteRoom', FavoriteRoomSchem);