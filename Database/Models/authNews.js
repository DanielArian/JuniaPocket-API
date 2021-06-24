const mongoose = require('mongoose');

var AuthNewsSchem = new mongoose.Schema({
  list: [String]
});

module.exports = mongoose.model('AuthNews', AuthNewsSchem);