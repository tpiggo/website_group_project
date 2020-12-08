const mongoose = require('mongoose');

const UserRequestsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userType: {
        type: Number,
        required: true
    },
    message : {
        type: String,
        required: true,
    }
});

const UserRequests = mongoose.model('UserRequests', UserRequestsSchema);

module.exports = UserRequests;