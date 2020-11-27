const mongoose = require('mongoose');

const AwardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    date: Date,
    description: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    }
});

const Award = mongoose.model('Award', AwardSchema);
module.exports = Award;