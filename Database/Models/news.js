const mongoose = require('mongoose');

var NewsSchem = new mongoose.Schema({
    auteur: String,
    titre: String,
    texte : String,
    date : Date,
    dest : [String]
});
const News = mongoose.model('News',NewsSchem);