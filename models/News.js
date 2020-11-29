const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    title: {
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
    creator: {
        type: String,
        required: true
    },
    creationDate: Date
});

const News = mongoose.model('News', NewsSchema);
module.exports = News;