const mongoose = require('mongoose');

const TAPostingSchema = new mongoose.Schema({
    faculty: {
        type: String,
        required: true
    },
    course: {
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
    }
});

const TAPosting = mongoose.model('Posting', TAPostingSchema);
module.exports = TAPosting;