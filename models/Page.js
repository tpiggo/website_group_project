const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
    title: {              // 'prospective'
        type: String,
        required: true,
        unique: true
    },
    path: String,
    subpages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subpage"
        }
    ]
});

const Page = mongoose.model('Page', PageSchema);
module.exports = Page;