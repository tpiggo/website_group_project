const mongoose = require('mongoose');

const SubpageSchema = new mongoose.Schema({
    name: String, // 'General Information', 'Why CS ?'
    path: {    
        type: String,
        unique: true
    },
    html: String,
    markdown: String,
    submenu: {
        type: [Object],
        default: undefined
    }
});

module.exports = mongoose.model('Subpage', SubpageSchema);