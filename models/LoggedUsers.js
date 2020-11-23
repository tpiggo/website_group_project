const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Creating a Schema to hold logged in users.
 * Have to find a way to erase them once they have been removed?
 * Need to think about this
 */
const LoggedUsers = new Schema({
    ticket: {
        type: Number,
        unique: true,
        required: true
    },
    userID:{
        type: Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('LoggedUsers', LoggedUsers);