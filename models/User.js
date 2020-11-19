const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: Number,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    }

});

const User = mongoose.model('User', UserSchema);

module.exports = User;