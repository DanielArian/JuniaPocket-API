const mongoose = require('mongoose');

const WeekSchema = mongoose.Schema({
    weekNumber: String,
    year: String,
    beginDate: String,
    data: Object
},{ _id : false });

const PlanningSchema = mongoose.Schema({
    aurionID: String,
    weeks: [WeekSchema]
});

module.exports = mongoose.model('Planning', PlanningSchema);