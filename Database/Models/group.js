const mongoose = require('mongoose');

const GroupeSchema = mongoose.Schema({
    groupName: String,
    list: [String]
});

module.exports = mongoose.model('Group', GroupeSchema);