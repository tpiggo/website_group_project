const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const middleware = require("../middleware");
const fs = require('fs');
const TAPosting = require('../models/TAPosting');
const Course = require('../models/Courses');
const Event = require('../models/Events');
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const Award = require('../models/Award');
const multer = require('multer');
const path = require('path');
// Body parser for these routes. Needed since sending JSONs to and from the frontend.
router.use(bodyParser.json());


var upload = multer({
    dest: path.join(__dirname, "../fileHolderDir/")
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

// Add TA form API
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

// TODO: Implement this route
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
                }, (err, award) => {
                    if (err) reject({ status: 2, response: 'Error creating award!' });
                    else {
                        resolve({
                            status: 0,
                            response: 'Award created!',
                            eventTitle: {
                                title: award.title,
                                recipient: award.recipient,
                                id: award._id
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

// TODO: Implement this route
router.post('/News', middleware.isAuthenticated, (req, res) => {
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
    console.log("Sent response");
});

// TODO: Implement this route
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

// TODO: Implement this route
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
    const { techTitle, techContact, techDescription } = req.body
    findTechnicalReport(techTitle, user)
        .then(report => {
            return createReport(report);
        })
        .then(response => res.json(response))
        .catch(err => res.json(err));
});

// TODO: Implement this route
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

router.post('/Course', upload.single("syllabus"), middleware.isAuthenticated, (req, res) => {
    console.log("Checking the file", req.file, req.body);
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

//  ********************************* UPDATING REQUESTS *********************************

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

router.put('/Course', middleware.isAuthenticated, (req, res) => {
    var id = req.body._id;
    delete req.body._id;

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


/**
 * Testing forms
 */
router.post("/fileUploader", upload.single("file"), (req, res) => {
    console.log(req.body, req.file);
    console.log(JSON.stringify(req.headers));
    res.redirect('/dashboard');
});


module.exports = router;


