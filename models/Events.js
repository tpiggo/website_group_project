const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    start: Date,
    end: Date,
    hostedBy: {
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

const Events = mongoose.model('Events', EventSchema);
module.exports = Events;