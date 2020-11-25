const mongoose = require('mongoose');

const SubpageSchema = new mongoose.Schema({
    name: {    // 'General Information', 'Why CS ?'
        type: String,
        unique: true
    },  
    path: String,
    html: String,
    markdown: String
});

module.exports = mongoose.model('Subpage', SubpageSchema);