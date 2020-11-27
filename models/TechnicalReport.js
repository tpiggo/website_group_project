const mongoose = require('mongoose');
const TechReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    creator : {
        type: String,
        required: true
    },
    contact :{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reportDate:{
        type: Date,
        required: true
    },
    editors: [mongoose.Types.ObjectId],
    lastEdited: Date
});

const TechnicalReport = mongoose.model('TechnicalReport', TechReportSchema);
module.exports = TechnicalReport;