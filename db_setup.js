const mongoose = require('mongoose');

const Pages = require('./models/Page.js');
const SubPages = require('./models/Subpage.js');

const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('MongoDB Connected!')})
    .catch(err => { console.log(err) });


var subpagesd = [{
    name: "General Information",
    html: "<b> General Information</b>",
}, {
    name: "Why CS?",
    html: "<b>Why CS?</b>",
}, {
    name: "CEGEP",
    html: "<b> CEGEP</b>",
}, {
    name: "Freshman",
    html: "<b> Freshman</b>",
}, {
    name: "Choosing a Major",
    html: "<b> Choosing a Major</b>",
}, {
    name: "Transfer",
    html: "<b>Transfer</b>",
}, {
    name: "Internship",
    html: "<b>Internship</b>",
}, {
    name: "Undergraduate",
    html: "<b>Undergraduate</b>",
}, {
    name: "Graduate",
    html: "<b>Graduate</b>",
}]

var page = {
    title: "Prospective",
    subpages: []
};

//create subpages one by one (for loop doesn't work)
//SubPages.create(subpagesd[8], (err, content) => {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         content.forEach(subp => {
    //             ids.push(subp._id);
    //         })
    //     }
    // });

SubPages.find({}, (err, content) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Data found");
        var subId = [];
        
        //find the _id's of all subpages and store them in subId[]
        content.forEach(subp => {
            subId.push(subp._id);
        });

        //create the prospective page
        Pages.create({title:"Prospective", subpages: subId}, (err, content) => {
            if (err) {
                console.error(err);
            }
            else  console.log("Data created");
        });
    }
});


// var ids = [];
// SubPages.find({}, (err, content) => {
//     if (err) {
//         console.error(err);
//     } else {
//         content.forEach(subp => {
//             ids.push(subp._id);
//         })
//     }
// });

// console.log('ids');


// Pages.deleteMany({ title: "Prospective" }, (err, content) => {
//     if (err) {
//         console.error(err);
//     } else console.log("data deleted: " + content.title);
// }
// );
