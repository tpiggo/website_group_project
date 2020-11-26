const mongoose = require('mongoose');

const TAPostingSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    spaces: {
        type: Number,
        required: true
    }
});

const TAPosting = mongoose.model('Posting', TAPostingSchema);
module.exports = TAPosting;