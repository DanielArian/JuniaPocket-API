const mongoose = require('mongoose');

const MarkSchema = mongoose.Schema({
    aurionID: String,
    lastUpdate: Date,
    marks: [Object]
});

module.exports = mongoose.model('Mark', MarkSchema);