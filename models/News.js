const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    faculty: {
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
    }
});

const News = mongoose.model('News', NewsSchema);
module.exports = News;