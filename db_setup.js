const mongoose = require('mongoose');

const Pages = require('./models/Page.js');
const SubPages = require('./models/Subpage.js');

const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('MongoDB Connected!') })
    .catch(err => { console.log(err) });


// var subpagesProspective = [{
//     name: "General Information",
//     html: "<b> General Information</b>",
// }, {
//     name: "Why CS?",
//     html: "<b>Why CS?</b>",
// }, {
//     name: "CEGEP",
//     html: "<b> CEGEP</b>",
// }, {
//     name: "Freshman",
//     html: "<b> Freshman</b>",
// }, {
//     name: "Choosing a Major",
//     html: "<b> Choosing a Major</b>",
// }, {
//     name: "Transfer",
//     html: "<b>Transfer</b>",
// }, {
//     name: "Internship",
//     html: "<b>Internship</b>",
// }, {
//     name: "Undergraduate",
//     html: "<b>Undergraduate</b>",
// }, {
//     name: "Graduate",
//     html: "<b>Graduate</b>",
// }]

var subpagesAcademic = [{
    name: "Undergraduate",
    html: "<h1>Overview</h1>",
    markdown: "",
    path: "academic/undergraduate/",
    submenu: [
        { name: 'Information for Incoming Student', path: 'academic/undergraduate/incoming-student' },
        { name: 'Remote Learning', path: 'academic/undergraduate/remote-learning' },
        { name: 'FAQ', path: 'academic/undergraduate/faq' },
        { name: 'Advising', path: 'academic/undergraduate/advising' }
    ]
}, {
    name: "Graduate",
    html: "<h1>Overview</h1>",
    markdown: "",
    path: "academic/graduate/",
    submenu: [
        { name: 'Masters', path: 'academic/graduate/masters' },
        { name: 'Ph. D.', path: 'academic/graduate/phd' },
        { name: 'Admission', path: 'academic/graduate/admission' },
        { name: 'Applying', path: 'academic/graduate/applying' },
        { name: 'FAQ', path: 'academic/graduate/faq' }
    ]
}, {
    name: "Courses",
    html: "<h2>Courses</h2>",
    markdown: "",
    path: "academic/courses"
}, {
    name: "Teaching Assistant ",
    html: "<h1>TA & Research Assistant</h1>",
    markdown: "",
    path: "academic/ta/",
    submenu: [
        { name: 'TA awards', path: 'academic/ta/taAwards' }
    ]
}, {
    name: "Funding",
    html: "<h1>Financial Information</h1>",
    markdown: "",
    path: "academic/funding/",
    submenu: [
        { name: 'Graduate Scholarship', path: 'academic/funding/gradScholarship' }
    ]
}];

// var subSubpages = [
//     {
//         name: 'Information for Incoming Student',
//         html: "<h1>Information for Incoming Student</h1>",
//         markdown: "",
//         path: 'academic/undergraduate/incoming-student'
//     },
//     {
//         name: 'Remote Learning',
//         html: "<h1>Remote Learning</h1>",
//         markdown: "",
//         path: 'academic/undergraduate/remote-learning'
//     },
//     {
//         name: 'FAQ',
//         html: "<h1>FAQ</h1>",
//         markdown: "",
//         path: 'academic/undergraduate/faq'
//     },
//     {
//         name: 'Advising',
//         html: "<h1>Advising</h1>",
//         markdown: "",
//         path: 'academic/undergraduate/advising'
//     },
//     {
//         name: 'Masters',
//         html: "<h1>Masters</h1>",
//         markdown: "",
//         path: 'academic/graduate/masters'
//     },
//     {
//         name: 'Ph. D.',
//         html: "<h1>Ph. D.</h1>",
//         markdown: "",
//         path: 'academic/graduate/phd'
//     },
//     {
//         name: 'Admission',
//         html: "<h1>Admission</h1>",
//         markdown: "",
//         path: 'academic/graduate/admission'
//     },
//     {
//         name: 'Applying',
//         html: "<h1>Applying</h1>",
//         markdown: "",
//         path: 'academic/graduate/applying'
//     },
//     {
//         name: 'FAQ',
//         html: "<h1>FAQ</h1>",
//         markdown: "",
//         path: 'academic/graduate/faq'
//     },
//     {
//         name: 'TA awards',
//         html: "<h1>TA awards</h1>",
//         markdown: "",
//         path: 'academic/ta/taAwards'
//     },
//     {
//         name: 'Graduate Scholarship',
//         html: "<h1>Graduate Scholarship</h1>",
//         markdown: "",
//         path: 'academic/funding/gradScholarship'
//     }
// ];

var pages = [{
    title: "Prospective",
    path: 'prospective',
    subpages: []
}, {
    title: "Academic",
    path: 'academic',
    subpages: []
}
];

function createSubpage(subpage) {
    return new Promise((resolve, reject) => {
        SubPages.create(subpage, (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
}

var idArr = [];
createSubpage(subpagesAcademic[0]).then(content => {
    idArr.push(content._id);
    return createSubpage(subpagesAcademic[1])
}).then(content1 => {
    idArr.push(content1._id);
    return createSubpage(subpagesAcademic[2])
}).then(content2 => {
    idArr.push(content2._id);
    return createSubpage(subpagesAcademic[3])
}).then(content3 => {
    idArr.push(content3._id);
    return createSubpage(subpagesAcademic[4])
}).then(content4 => {
    idArr.push(content4._id);

    pages[1].subpages = idArr;
    Pages.create(pages[1], (err, content) => {
        if (err) {
            console.error(err);
        }
        else console.log("Data created");
    });

}).catch(err => {
    console.log(err);
});




// SubPages.find({}, (err, content) => {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log("Data found");
//         var subId = [];

//         //find the _id's of all subpages and store them in subId[]
//         content.forEach(subp => {
//             subId.push(subp._id);
//         });

//         //create the prospective page
//         Pages.create({title:"Prospective", subpages: subId}, (err, content) => {
//             if (err) {
//                 console.error(err);
//             }
//             else  console.log("Data created");
//         });
//     }
// });


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
