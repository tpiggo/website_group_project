const mongoose = require('mongoose');

const PostingSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    start: Date,
    end: Date,
    contact: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    creationDate: Date
});

const Posting = mongoose.model('Posting', PostingSchema);
module.exports = Posting;