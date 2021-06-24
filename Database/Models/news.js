const mongoose = require('mongoose');

var NewsSchem = new mongoose.Schema({
    auteur: String,
    titre: String,
    texte : String,
    date : Date,
    dest : [String]
});

module.exports = mongoose.model('News', NewsSchem);