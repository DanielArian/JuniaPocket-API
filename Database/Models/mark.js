const mongoose = require('mongoose');

const MarkSchema = mongoose.Schema({
    aurionID: String,
    marks: [Object]
});

module.exports = mongoose.model('Mark', MarkSchema);