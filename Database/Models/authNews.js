const mongoose = require('mongoose');

var AuthNewsSchem = new mongoose.Schema({
    list : [String]
  });
  const AuthNews = mongoose.model('AuthNews',AuthNewsSchem);