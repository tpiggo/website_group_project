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
const mongoose = require('mongoose');
const e = require('express');
// Body parser for these routes. Needed since sending JSONs to and from the frontend.
router.use(bodyParser.json());

function handleError(err, type){
    console.log(err);
    if( err && err.code == 11000 ){
        type = type.charAt(0).toUpperCase() + type.slice(1);
        return { status: 1, response: type + ' already exists!' };
    } else if ( err )  {
        return { status: 2, response: 'Error during creation of '+ type };
    }
}


/**
 * Dashboard forms 
 */

// Add TA form API
router.post('/addTA', middleware.isAuthenticated, (req, res) => {
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
            Course.find({ title: {'$regex': title, '$options': 'ix'}, termsOffered: semester }, (err, match) => {
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
                TAPosting.create({ ...content, creator: req.session.username }, (err, createdPost) => {
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
router.post('/addAward', middleware.isAuthenticated, (req, res) => {
    // Auth the session
    console.log(req.body);

    /**
     * @description Finds an award or produces an error
     * @param {String} title 
     * @param {String} recipient 
     * @returns {Promise}
     */
    function findAward(title, recipient){
        return new Promise((resolve, reject)=>{
            Award.findOne({'$and':[{title: title}, {recipient: recipient}]}, (err, result) => {
                if (err){
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
                }, (err, award)=>{
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
router.post('/addNews', middleware.isAuthenticated, (req, res) => {
    /** 
     * Not enforcing unique names for the articles.
     * Return object Id for rendering of article
     */

    News.create({
        ...req.body,
        creator: req.session.username
    }, (err, result) => {
        if (err){
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
router.post('/addEvent', middleware.isAuthenticated, (req, res) => {
    console.log(req.body);
    // Search for an event which already exists
    /**
     * @description Finds an event if there is one
     * @param {String} title 
     * @param {Date} start 
     * @param {String} eventType 
     * @returns {Promise}
     */
    function findEvent(title, start, eventType){
        return new Promise((resolve, reject) => {
            Event.findOne({
                "$and": [
                    { title: title },
                    { start: start },
                    { eventType: eventType }
                ]
            },(err, event) => {
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
    function createEvent(event){
        return new Promise((resolve, reject) =>{
            if (event){
                reject({ status: 1, response: 'Event exists. Please update it!' });
            } else {
                Event.create({
                    ...req.body,
                    creator: req.session.username
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
    findEvent(req.body.title, req.body.start, req.body.eventType )
        .then((event) => {
            return createEvent(event);
        })
        .then((response) => res.json(response))
        .catch((msg) => res.json(msg));
});

// TODO: Implement this route
router.post('/addTech', middleware.isAuthenticated, (req, res) => {
    /**
     * @description Finds a technical report if one exists
     * @param {String} title 
     * @param {User} user 
     * @returns {Promise} 
     */ 
    function findTechnicalReport(title, user){
        return new Promise((resolve, reject) => {
            TechnicalReport.findOne({
                "$and": [
                    { title: title },
                    { createdBy: user },
                ]
            }, (err, report) => {
                if (err) {
                    reject({status: 2, response: 'Error accessing database! Try again later!'});
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
    function createReport(report){
        return new Promise((resolve, reject) => {
            if (report) reject({status: 1, response: 'This report has already been submitted!'});
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
                            report: {title: techTitle, id: result._id}
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
router.post('/addPosting', middleware.isAuthenticated, (req, res) => {
    // Auth the session
    // setting params
    const {
        postingTitle
    }  = req.body; 
    console.log(req.body);
    Posting.create({
        ...req.body,
        creator: req.session.username
    }, (err, result)=>{
        if (err) res.json(handleError(err, "posting"));
        else {
            res.json({
                status: 0, 
                response: 'Posting created!',
                posting: {title: postingTitle, id: result._id}
            });
        }
    });
});

/** 
 * TODO: Fix the Courses "Add" button in order to create a new Course.
 * Maybe we could use a scraper in order to scrape the courses for CS off the McGill website? 
 */
router.post('/addCourse', middleware.isAuthenticated, (req, res) => {
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

module.exports = router;


