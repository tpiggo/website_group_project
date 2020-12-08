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
router.post('/TA', middleware.isAuthenticated, (req, res) => {
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
            Course.find({ title: { '$regex': title, '$options': 'ix' }, termsOffered: semester }, (err, match) => {
                if (err) {
                    console.error(err);
                    reject({ status: 2, response: 'Error accessing Course database! Try again later!' });
                } else {
                    console.log("found a course");
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
                TAPosting.findOne({ courseTitle: req.body.courseTitle.toUpperCase(), semester: req.body.semester }, (err, coursePost) => {
                    if (err) {
                        console.error(err);
                        reject({ status: 2, response: 'Error accessing TAP database! Try again later!' });
                    } else {
                        console.log("returning a coursepost", coursePost);
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
                        console.log("returning a created post", createdPost);
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
                console.log("found a course posting!")
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
router.post('/Award', middleware.isAuthenticated, (req, res) => {
    // Auth the session
    console.log(req.body);
    console.log('received post request for award');

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
router.get('/Award', middleware.isAuthenticated, (req, res) => {
    Award.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log('content found !');
                res.json({ status: 0, response: 'Award found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Award can't be found - Internal error or award deleted" });
            }

        }
    });

});

// update route for awards
router.put('/Award', middleware.isAuthenticated, (req, res) => {
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

router.delete('/Award', middleware.isAuthenticated, (req, res) => {
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
router.post('/News', middleware.isAuthenticated, (req, res) => {
    /**
     * Not enforcing unique names for the articles.
     * Return object Id for rendering of article
     */
    console.log(req.body);

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
    console.log("Sent response");
});



// Information acquisition route for news
router.get('/News', (req, res) => {
    News.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log('content found !');
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
router.put('/News', middleware.isAuthenticated, (req, res) => {
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

router.delete('/News', middleware.isAuthenticated, (req, res) => {
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
router.post('/Event', middleware.isAuthenticated, (req, res) => {
    console.log(req.body);
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
router.get('/Event', (req, res) => {
    Event.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log('content found !');
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
router.put('/Event', middleware.isAuthenticated, (req, res) => {
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

router.delete('/Event', middleware.isAuthenticated, (req, res) => {
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
router.post('/Tech', middleware.isAuthenticated, (req, res) => {
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

    console.log(req.body);
    const user = req.session.username;
    //BUG
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
                console.log('content found !');
                console.log(content);
                res.json({ status: 0, response: 'Technical Report found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Technical report can't be found -  Internal error or report deleted" });
            }

        }
    });

});

router.put('/Tech', middleware.isAuthenticated, (req, res) => {
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

router.delete('/Tech', middleware.isAuthenticated, (req, res) => {
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
router.post('/Posting', middleware.isAuthenticated, (req, res) => {
    // Auth the session
    // setting params
    const {
        postingTitle
    } = req.body;
    console.log(req.body);
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
router.put('/Posting', middleware.isAuthenticated, (req, res) => {
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
router.get('/Posting', middleware.isAuthenticated, (req, res) => {
    Posting.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log('content found !');
                res.json({ status: 0, response: 'Posting found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Posting can't be found - Internal error or posting deleted" });
            }

        }
    });
});

router.delete('/Posting', middleware.isAuthenticated, (req, res) => {
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
router.post('/Course', upload.single("syllabus"), middleware.isAuthenticated, (req, res) => {
    // Fix syllabus, add its path rather than its name
    req.body.syllabus = req.file.filename;
    Course.create(req.body, (err, content) => {
        if (err) res.json(handleError(err, 'course'));
        else {
            console.log(content);
            res.json({
                status: 0,
                response: 'Course created!',
                posting: { title: content.title, id: content._id }
            });
        }
    });
});

router.put('/Course', upload.single("syllabus"), middleware.isAuthenticated, (req, res) => {
    var id = req.body._id;
    delete req.body._id;
    req.body.syllabus = req.file.filename;
    Course.findByIdAndUpdate(id, req.body, (err, update)=> {
        if(err){
            console.error(err);
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
                })
            }
        }
    });

});

// Information acquisition route for courses
router.get('/Course', (req, res) => {
    Course.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log('content found !');
                console.log(content);
                res.json({ status: 0, response: 'Course found', posting: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Course can't be found -  Internal error or course deleted" });
            }

        }
    });

});
router.delete('/Course', middleware.isAuthenticated, (req, res) => {
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
    Page.findById(req.body.category, (err,page) => {
        if(err){
            console.log(err);
            return res.json({status: 1, response: "Invalid category selection"});
        }else if(page){
            var path = page.title.toLowerCase() + "/" + req.body.page_name.toLowerCase();
            Subpage.create({
                name: req.body.page_name,
                markdown: "",
                html: "",
                path,
                submenu: null
            }, (err,subpage) => {
                if(err){
                    console.log(err);
                    return res.json({status: 1, response: "Error while creating subpage"});
                }else if(subpage){
                    console.log(page);
                    console.log(page.subpages);
                    page.subpages.push(subpage);
                    page.save((err) => {
                        if(err){
                            console.log(err);
                        }
                    });
                    return res.json({status: 0, response: "Subpage successfully created"});
                }
            });
        }else{
            console.log("Could not find page with id: " +req.body.category);
            return res.json({status: 1, response: "Invalid category selection"});
        }
    });
});

router.post('/Subpage-Delete', middleware.canCreateOrDestroy, (req,res) => {
    console.log(req.body);
    Subpage.findByIdAndDelete(req.body.page_id, (err,subpage) => {
        if(err){
            res.json({status: 1, response: "Error deleting subpage"});
        }else{
            var page_path = subpage.path.replace(/\/.+/,'').toLowerCase();
            console.log("Page path: " + page_path);
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
    console.log(path);
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
                    return res.json({status: 1, response: "Error occured while creating category"});
                    Page.findByIdAndDelete(page.id); //Clean up the page if we messed it up
                }else if(page){
                    return res.json({status: 0, response: "Category created successfully"});
                }
            })
        }
    });
});

// ********************** USER REQUEST UPDATES ***************************

router.get('/user-requests', (req, res) => {
    console.log('user request received !');
    console.log('id : ' +req.query.id );
    UserRequest.findById(req.query.id, (err, content) => {
        if (err) {
            console.error(err);
            res.json({ status: 2, response: "Internal Error" });
        } else {
            if (content) {
                console.log('user request found !');
                res.json({ status: 0, response: 'User Request Accepted Succesfully', request: content });
            } else {
                console.log('content not found');
                res.json({ status: 1, response: "Error : Request can't be found - Internal error or request deleted" });
            }
        }
    });

});

router.put('/user-requests', (req, res) => {
    var id = req.body._id;
    console.log('modifying user type !');
    console.log(id + req.body);

    UserRequest.deleteOne({_id:id})
        .then(result=>{
            if ( result.ok == 1 && result.deletedCount > 0 && result.n > 0){
                console.log("Successfully deleted!");
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

router.delete('/user-requests', (req,res) => {
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


