const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
    aurionID: String,
    display: String,
    widgetPreference: Object,
    habits: Array
});

module.exports = mongoose.model('Widget', WidgetSchema);