const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const middleware = require("../middleware");
const TAPosting = require('../models/TAPosting');
const Course = require('../models/Courses');
const Event = require('../models/Events');
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const Award = require('../models/Award');
const UserRequest = require('../models/UserRequest');
const Subpage = require('../models/Subpage');
const Page = require('../models/Page');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
// Body parser for these routes. Needed since sending JSONs to and from the frontend.
router.use(bodyParser.json());


var upload = multer({
    dest: path.join(__dirname, "../files/")
});



/**
 * Responds with appropriate error message when Creating an element to DB
 * @param {Error} err
 * @param {String} type type of error
 */
function handleError(err, type) {
    console.log(err);
    if (err && err.code == 11000) {
        type = type.charAt(0).toUpperCase() + type.slice(1);
        return { status: 1, response: type + ' already exists!' };
    } else if (err) {
        return { status: 2, response: 'Error during creation of ' + type };
    }
}


/**
 * Dashboard forms
 */

//  ********************************* TA REQUESTS *********************************
router.post('/TA', middleware.isAuthDashboard(), (req, res) => {
    // Last logical is up for changing depending on how we maintain summer semester (since there are 2)
    // Query to find a course which contains the same name during the same semester

    /**
     * Finds course based on title and semester
     *
     * @param {string} title Title of course
     * @param {string} semester Title of semester
     * @returns {Promise}
     */
    function findCourse(title, semester) {
        return new Promise((resolve, reject) => {
            Course.find({ title:title, termsOffered: { $all : [semester] } }, (err, match) => {
                if (err) {
                    console.error(err);
                    reject({ status: 2, response: 'Error accessing Course database! Try again later!' });
                } else {
                    resolve(match);
                }
            });
        });
    }

    /**
     * Finds one TA post from a course
     * @param {object} course Course object
     * @returns {Promise}
     */
    function findTAPosting(course) {
        return new Promise((resolve, reject) => {
            if (course.length > 0) {
                TAPosting.findOne({ courseTitle: req.body.courseTitle, semester: req.body.semester }, (err, coursePost) => {
                    if (err) {
                        console.error(err);
                        reject({ status: 2, response: 'Error accessing TAP database! Try again later!' });
                    } else {
                        resolve(coursePost)
                    }
                });
            } else {
                console.warn('No match! for : [' + req.body.courseTitle + '] and [' + req.body.semester + "]");
                reject({ status: 1, response: "Invalid course or semester!" });
            }
        });
    }

    /**
     * Creates a post if it doesn't already exist
     *
     * @param {object} post Post
     * @returns {Promise}
     */
    function createPost(post) {
        return new Promise((resolve, reject) => {
            if (!post) {
                const content = req.body;
                TAPosting.create({ ...content, creator: req.session.username, creationDate: Date.now() }, (err, createdPost) => {
                    if (err) {
                        console.error(err);
                        reject({ status: 2, response: 'Error creating the course!' });
                    } else {
                        resolve({
                            status: 0,
                            response: 'Creating a posting for TA!',
                            taPosting: {
                                course: req.body.courseTitle,
                                semester: req.body.semester,
                                id: createdPost._id
                            }
                        });
                    }
                })
            } else {
                reject({ status: 1, response: 'Course Posting exists already! Please update it' });
            }
        });
    }

    findCourse(req.body.courseTitle, req.body.semester).then(found => {
        return findTAPosting(found);
    }).then(post => {
        return createPost(post);
    }).then(response => {
        res.json(response);
    }).catch(msg => {
        res.json(msg);
    });

});

//  ********************************* AWARD REQUESTS *********************************
router.post('/Award', middleware.isAuthDashboard(), (req, res) => {
    // Auth the session

    /**
     * @description Finds an award or produces an error
     * @param {String} title
     * @param {String} recipient
     * @returns {Promise}
     */
    function findAward(title, recipient) {
        return new Promise((resolve, reject) => {
            Award.findOne({ '$and': [{ title: title }, { recipient: recipient }] }, (err, result) => {
                if (err) {
                    console.error(err);
                    reject({ status: 2, response: 'Error accessing database! Try again later!' })
                } else {
                    resolve(result);
                }
            });
        });
    }
    /**
     * @description Creates an award if there is no award given.
     * @param {Award} award
     * @returns {Promise}
     */
    function createAward(award) {
        return new Promise((resolve, reject) => {
            if (award) reject({ status: 1, response: 'Award exists! Please modify the existing award!' });
            else {
                Award.create({
                    ...req.body,
                    creator: req.session.username
                }, (err, newAward) => {
                    if (err) reject({ status: 2, response: 'Error creating award!' });
                    else {
                        resolve({
                            status: 0,
                            response: 'Award created!',
                            eventTitle: {
                                title: newAward.title,
                                recipient: newAward.recipient,
                                id: newAward._id
                            }
                        });
                    }
                })
            }
        });
    }
    // Run the functions and handle the returns
    findAward(req.body.title, req.body.recipient)
        .then(award => {
            return createAward(award);
        })
        .then(msg => {
            res.json(msg);
        })
        .catch(msg => {
            res.json(msg);
        })
});

// Award Information
router.get('/Award', middleware.isAuthDashboard(), (req, res) => {
    Award.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                res.json({ status: 0, response: 'Award found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Award can't be found - Internal error or award deleted" });
            }

        }
    });

});

// update route for awards
router.put('/Award', middleware.isAuthDashboard(), (req, res) => {
    var id = req.body._id;
    delete req.body._id;

    Award.findByIdAndUpdate(id, req.body, (err, update)=> {
        if(err){
            console.error(err);
            res.json({status:2, response:'Error while accessing the databse'});
        } else {
            if(update) {
                res.json({
                    status:0,
                    response: 'Award was succesfully updated'
                });
            } else {
                res.json({
                    status: 1,
                    response: 'Award deleted, please close window, the current form is invalid'
                })
            }
        }
    });

});

router.delete('/Award', middleware.isAuthDashboard(), (req, res) => {
    Award.deleteOne(req.body)
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                res.json({status: 0, response: "Successfully deleted!"});
            } else {
                res.json({status: 2, response: "Error deleting! Try again later"})
            }
        })
        .catch(err=>{
            console.error(err);
            res.json({status: 2, response: "Error accessing database"});
        });
});

//  ********************************* NEWS REQUESTS *********************************
router.post('/News', middleware.isAuthDashboard(), (req, res) => {
    /**
     * Not enforcing unique names for the articles.
     * Return object Id for rendering of article
     */

    News.create({
        ...req.body,
        creator: req.session.username,
        creationDate: Date.now()
    }, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ status: 2, response: 'Error accessing database! Try again later!' });
        } else {
            res.json({
                status: 0,
                response: 'News article created!',
                article: {
                    title: req.body.title,
                    creator: req.session.username,
                    id: result._id
                }
            });
        }
    });
});



// Information acquisition route for news
router.get('/News', middleware.isAuthDashboard() ,(req, res) => {
    News.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log(content);
                res.json({ status: 0, response: 'News found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : News can't be found -  Internal error or news deleted" });
            }

        }
    });

});

// Update route for News
router.put('/News', middleware.isAuthDashboard(), (req, res) => {
    var id = req.body._id;
    delete req.body._id;

    News.findByIdAndUpdate(id, req.body, (err, update)=> {
        if(err){
            console.error(err);
            res.json({status:2, response:'Error while accessing the databse'});
        } else {
            if(update) {
                res.json({
                    status:0,
                    response: 'News was succesfully updated'
                });
            } else {
                res.json({
                    status: 1,
                    response: 'News deleted, please close window, the current form is invalid'
                })
            }
        }
    });

});

router.delete('/News', middleware.isAuthDashboard(), (req, res) => {
    News.deleteOne(req.body)
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                res.json({status: 0, response: "Successfully deleted!"});
            } else {
                res.json({status: 2, response: "Error deleting! Try again later"})
            }
        })
        .catch(err=>{
            console.error(err);
            res.json({status: 2, response: "Error accessing database"});
        });
});

//  ********************************* EVENT REQUESTS *********************************
router.post('/Event', middleware.isAuthDashboard(), (req, res) => {
    // Search for an event which already exists
    /**
     * @description Finds an event if there is one
     * @param {String} title
     * @param {Date} start
     * @param {String} eventType
     * @returns {Promise}
     */
    function findEvent(title, start, eventType) {
        return new Promise((resolve, reject) => {
            Event.findOne({
                "$and": [
                    { title: title },
                    { start: start },
                    { eventType: eventType }
                ]
            }, (err, event) => {
                if (err) reject({ status: 2, response: 'Error accessing database! Try again later!' });
                else {
                    resolve(event);
                }
            });
        });
    }

    /**
     * @description Creates an event given the event doesn't already exist
     * @param {Event} event
     * @returns {Promise}
     */
    function createEvent(event) {
        return new Promise((resolve, reject) => {
            if (event) {
                reject({ status: 1, response: 'Event exists. Please update it!' });
            } else {
                Event.create({
                    ...req.body,
                    creator: req.session.username,
                    creationDate: Date.now()
                }, (err, createdEvent) => {
                    if (err) reject({ status: 2, response: 'Error creating event!' });
                    else resolve({
                        status: 0,
                        response: 'Event created!',
                        event: { eventTitle: req.body.title, id: createdEvent._id }
                    })
                });
            }
        });
    }

    // Find event and handle
    findEvent(req.body.title, req.body.start, req.body.eventType)
        .then((event) => {
            return createEvent(event);
        })
        .then((response) => res.json(response))
        .catch((msg) => res.json(msg));
});

// Information acquisition route for events
router.get('/Event', middleware.isAuthDashboard(),(req, res) => {
    Event.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log(content);
                res.json({ status: 0, response: 'Event found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Event can't be found -  Internal error or course deleted" });
            }

        }
    });

});

// Update route for Events
router.put('/Event', middleware.isAuthDashboard(), (req, res) => {
    var id = req.body._id;
    delete req.body._id;

    Event.findByIdAndUpdate(id, req.body, (err, update)=> {
        if(err){
            console.error(err);
            res.json({status:2, response:'Error while accessing the databse'});
        } else {
            if(update) {
                res.json({
                    status:0,
                    response: 'Event was succesfully updated'
                });
            } else {
                res.json({
                    status: 1,
                    response: 'Event deleted, please close window, the current form is invalid'
                })
            }
        }
    });

});

router.delete('/Event', middleware.isAuthDashboard(), (req, res) => {
    Event.deleteOne(req.body)
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                res.json({status: 0, response: "Successfully deleted!"});
            } else {
                res.json({status: 2, response: "Error deleting! Try again later"})
            }
        })
        .catch(err=>{
            console.error(err);
            res.json({status: 2, response: "Error accessing database"});
        });
});

//  ********************************* TECH REQUESTS *********************************
router.post('/Tech', middleware.isAuthDashboard(), (req, res) => {
    /**
     * @description Finds a technical report if one exists
     * @param {String} title
     * @param {User} user
     * @returns {Promise}
     */
    function findTechnicalReport(title, user) {
        return new Promise((resolve, reject) => {
            TechnicalReport.findOne({
                "$and": [
                    { title: title },
                    { createdBy: user },
                ]
            }, (err, report) => {
                if (err) {
                    reject({ status: 2, response: 'Error accessing database! Try again later!' });
                    console.error(err);
                } else {
                    resolve(report);
                }
            })
        });
    }
    /**
     * @description Creates a report given that one does not already exist
     * @param {TechnicalReport} report
     * @returns {Promise}
     */
    function createReport(report) {
        return new Promise((resolve, reject) => {
            if (report) reject({ status: 1, response: 'This report has already been submitted!' });
            else {
                TechnicalReport.create({
                    ...req.body,
                    creator: req.session.username,
                    reportDate: Date.now(),
                    editors: [],
                    lastEdited: Date.now()
                }, (err, result) => {
                    if (err) reject(handleError(err, "report"));
                    else {
                        resolve({
                            status: 0,
                            response: 'New technical report created!',
                            report: { title: techTitle, id: result._id }
                        });
                    }
                });
            }
        })
    }

    const user = req.session.username;
    const { techTitle, techContact, techDescription } = req.body
    findTechnicalReport(techTitle, user)
        .then(report => {
            return createReport(report);
        })
        .then(response => res.json(response))
        .catch(err => res.json(err));
});


// Information acquisition route for tech
router.get('/Tech', (req, res) => {
    TechnicalReport.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log(content);
                res.json({ status: 0, response: 'Technical Report found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Technical report can't be found -  Internal error or report deleted" });
            }

        }
    });

});

router.put('/Tech', middleware.isAuthDashboard, (req, res) => {
    var id = req.body._id;
    delete req.body._id;

    TechnicalReport.findByIdAndUpdate(id, req.body, (err, update)=> {
        if(err){
            console.error(err);
            res.json({status:2, response:'Error while accessing the databse'});
        } else {
            if(update) {
                res.json({
                    status:0,
                    response: 'Technical report was succesfully updated'
                });
            } else {
                res.json({
                    status: 1,
                    response: 'Technical report deleted, please close window, the current form is invalid'
                })
            }
        }
    });

});

router.delete('/Tech', middleware.isAuthDashboard, (req, res) => {
    TechnicalReport.deleteOne(req.body)
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                res.json({status: 0, response: "Successfully deleted!"});
            } else {
                res.json({status: 2, response: "Error deleting! Try again later"})
            }
        })
        .catch(err=>{
            console.error(err);
            res.json({status: 2, response: "Error accessing database"});
        });
});


//  ********************************* POSTING REQUESTS *********************************
router.post('/Posting', middleware.isAuthDashboard, (req, res) => {
    // Auth the session
    // setting params
    const {
        postingTitle
    } = req.body;
    Posting.create({
        ...req.body,
        creator: req.session.username,
        creationDate: Date.now()
    }, (err, result) => {
        if (err) res.json(handleError(err, "posting"));
        else {
            res.json({
                status: 0,
                response: 'Posting created!',
                posting: { title: postingTitle, id: result._id }
            });
        }
    });
});

// Update route for Postings
router.put('/Posting', middleware.isAuthDashboard, (req, res) => {
    var id = req.body._id;
    delete req.body._id;

    Posting.findByIdAndUpdate(id, req.body, (err, update)=> {
        if(err){
            console.error(err);
            res.json({status:2, response:'Error while accessing the databse'});
        } else {
            if(update) {
                res.json({
                    status:0,
                    response: 'Posting was succesfully updated'
                });
            } else {
                res.json({
                    status: 1,
                    response: 'Posting deleted, please close window, the current form is invalid'
                })
            }
        }
    });

});



// Information acquisition route for postings
router.get('/Posting', middleware.isAuthDashboard, (req, res) => {
    Posting.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                res.json({ status: 0, response: 'Posting found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Posting can't be found - Internal error or posting deleted" });
            }

        }
    });
});

router.delete('/Posting', middleware.isAuthDashboard, (req, res) => {
    Posting.deleteOne(req.body)
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                res.json({status: 0, response: "Successfully deleted!"});
            } else {
                res.json({status: 2, response: "Error deleting! Try again later"})
            }
        })
        .catch(err=>{
            console.error(err);
            res.json({status: 2, response: "Error accessing database"});
        });
});

//  ********************************* COURSE REQUESTS *********************************
router.post('/Course', upload.single("syllabus"), middleware.isAuthDashboard, (req, res) => {
    // Fix syllabus, add its path rather than its name
    if (req.file != undefined){
        req.body.syllabus = req.file.filename;
    }else {
        req.body.syllabus = "noFile";
    }
    if (req.body.title.slice(4,5) != " "){
        req.body.title = req.body.title.slice(0, 4)+" "+req.body.title.slice(4);
    }
    req.body.termsOffered = req.body.termsOffered.split(",");
    Course.create(req.body, (err, content) => {
        if (err) {
            res.json(handleError(err, 'course'));
            // delete the file! DOESNT WORK?!?!?!?!?!
            fs.unlink(`../files/${req.file.filename}`, ()=>{
                console.log('Done unlinking!');
            });
        }
        else {
            res.json({
                status: 0,
                response: 'Course created!',
                posting: { title: content.title, id: content._id }
            });
        }
    });
});
//Route for uploading syllabi files
router.put('/Course', upload.single("syllabus"), middleware.isAuthDashboard, (req, res) => {
    var id = req.body._id;
    delete req.body._id;
    if (req.file != undefined){
        req.body.syllabus = req.file.filename;
    } else {
        req.body.syllabus = "noFile";
    }
    if (req.body.title.slice(4,5) != " "){
        req.body.title = req.body.title.slice(0, 4)+" "+req.body.title.slice(4);
    }
    Course.findByIdAndUpdate(id, req.body, (err, update)=> {
        if(err){
            console.error(err);
            // delete the file!
            fs.unlink(`../files/${req.file.filename}`, ()=>{
                console.log('Done unlinking!');
            });
            res.json({status:2, response:'Error while accessing the databse'});
        } else {
            if(update) {
                res.json({
                    status:0,
                    response: 'Course was succesfully updated'
                });
            } else {
                res.json({
                    status: 1,
                    response: 'Course deleted, please close window, the current form is invalid'
                });
                // delete the file!
                fs.unlink(`../files/${req.file.filename}`)
            }
        }
    });

});

// Information acquisition route for courses
router.get('/Course', middleware.isAuthDashboard, (req, res) => {
    Course.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log(content);
                res.json({ status: 0, response: 'Course found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Course can't be found -  Internal error or course deleted" });
            }

        }
    });
});

router.delete('/Course', middleware.isAuthDashboard, (req, res) => {
    Course.deleteOne(req.body)
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                res.json({status: 0, response: "Successfully deleted!"});
            } else {
                res.json({status: 2, response: "Error deleting! Try again later"})
            }
        })
        .catch(err=>{
            console.error(err);
            res.json({status: 2, response: "Error accessing database"});
        });
});



// *****************Adding and deleting subpages**************
router.post('/Subpage', middleware.canCreateOrDestroy, (req,res) => {
    if(!req.body.category || req.body.category == "Category"){
        return res.json({status: 1, response: "Invalid category selection"});
    }
    /**
     * @description Finds the elemetn by its ID
     * @param {ObjectID} id 
     * @returns {Promise}
     */
    function findPageById(id){
        return new Promise((resolve, reject) => {
            Page.findById(id, (err,page) => {
                if(err){
                    console.log(err);
                    reject({status: 1, response: "Invalid category selection"});
                } else {
                    resolve(page);
                }
            });
        });
    }

    /**
     * @description 
     * @param {Page} page 
     * @param {String} subpageName 
     * @param {String} path 
     * @returns {Promise}
     */
    function createPage(page, subpageName, path){
        return new Promise((resolve, reject) => {
            Subpage.create({
                name: subpageName,
                markdown: "",
                html: "",
                path,
                submenu: null
            }, (err,subpage) =>{
                if (err){
                    reject({status: 1, response: "Error while creating subpage"});
                } else {
                    page.subpages.push(subpage);
                    page.save((err) => {
                        if(err){
                            console.log(err);
                            reject({status: 1, response: "Error while saving in pages"});
                        }
                    });
                    resolve({status: 0, response: "Subpage successfully created"})
                }
            });
        });
    }
    // Going through the levels of the subpaging structure, in order to find the proper page.
    findPageById(req.body.category)
        .then(result => {
            let pagename = req.body.page_name.toLowerCase().replace(" ", "-");
            var path = result.title.toLowerCase() + "/" + pagename;
            // Create the new page 
            return createPage(result, req.body.page_name, path);
        })
        .then(result=>{
            res.json(result);
        })
        .catch(err=>{
            console.error(err);
            res.json(err);
        });
});

router.post('/Subpage-Delete', middleware.canCreateOrDestroy, (req,res) => {
    Subpage.findByIdAndDelete(req.body.page_id, (err,subpage) => {
        if(err){
            res.json({status: 1, response: "Error deleting subpage"});
        }else{
            var page_path = subpage.path.replace(/\/.+/,'').toLowerCase();
            Page.findOne({path: page_path}, (err,page) => {
                var page_index = page.subpages.indexOf(req.body.page_id);
                page.subpages.splice(page_index,1);
                page.save((err) => {
                    if(err){
                        console.log(err);
                    }
                });
            });
            res.json({status: 0, response: "Subpage successfully deleted"});
        }
    });
});

router.post('/Category', middleware.canCreateOrDestroy, (req,res) => {
    var path = req.body.category_name.toLowerCase();
    Page.exists({path}).then((name_taken) => {
        if(name_taken){
            return res.json({status: 1, response: "Error, a page with that name already exists"});
        }else{
            Page.create({
                title: req.body.category_name,
                path,
                subpages: []
            }, (err, page) => {
                if(err){
                    console.log(err);
                    Page.findByIdAndDelete(page.id); //Clean up the page if we messed it up
                    return res.json({status: 1, response: "Error occured while creating category"});
                }else if(page){
                    return res.json({status: 0, response: "Category created successfully"});
                }
            })
        }
    });
});

// ********************** USER REQUEST UPDATES ***************************

router.get('/user-requests',middleware.isAuthDashboard(2),  (req, res) => {
    UserRequest.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                res.json({ status: 0, response: 'User Request Accepted Succesfully', request: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Request can't be found - Internal error or request deleted" });
            }
        }
    });

});

router.put('/user-requests', middleware.isAuthDashboard(2), (req, res) => {
    var id = req.body._id

    UserRequest.deleteOne({_id:id})
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
            } else {
                console.log("Error deleting! Try again later");
            }
        })
        .catch(err=>{
            console.error(err);
        });

    User.updateOne({username: req.body.username}, {$set: { "userType" : req.body.userType }}, (err, update)=> {
        if(err){
            console.error(err);
            res.json({status:2, response:'Error while accessing the databse'});
        } else {
            if(update) {
                res.json({
                    status:0,
                    response: 'User was succesfully updated'
                });
            } else {
                res.json({
                    status: 1,
                    response: 'User request deleted, please close window, the current form is invalid'
                })
            }
        }
    });

});

router.delete('/user-requests', middleware.isAuthDashboard(2), (req,res) => {
    UserRequest.deleteOne(req.body)
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                res.json({status: 0, response: "Successfully deleted!"});
            } else {
                res.json({status: 2, response: "Error deleting! Try again later"})
            }
        })
        .catch(err=>{
            console.error(err);
            res.json({status: 2, response: "Error accessing database"});
        });
})

module.exports = router;


