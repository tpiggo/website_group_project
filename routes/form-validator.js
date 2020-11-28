const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const TAPosting = require('../models/TAPosting'); 
const Course = require('../models/Courses'); 
const Event = require('../models/Events');
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const Award = require('../models/Award');
const mongoose = require('mongoose');
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
// Add TA form
router.post('/addTA', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        var {
            course,
            semester,
            taContact,
            taDescription,
            spaces
        } = req.body;
        course = course.toUpperCase();
        if (semester.includes('f')) semester = semester.replace('f', "Fall ");
        else if (semester.includes('w')) semester = semester.replace('w', "Winter ");
        else if (semester.includes('s')) semester = semester.replace('s', "Summer "); 
        // Last logical is up for changing depending on how we maintain summer semester (since there are 2)
        // Query to find a course which contains the same name during the same semester
        Course.find({"$and": [
            {title: {'$regex': course, '$options': 'ix'}}, 
            {termsOffered: semester}
        ]})
            .then(result => {
                console.log(result);
                if (result.length > 0){
                    console.log("Found a match!")
                    
                    // Given there is a course in the courses database, we can move on to checking if
                    // There exists a TAPosting for this course for that semester. If not we can go ahead and post one!
                    TAPosting.findOne({'$and': [
                        { courseTitle : course }, 
                        { semester: semester }
                    ]})
                        .then(coursePosting=>{
                            // Checks if there was a posting found
                            if (!coursePosting){
                                TAPosting.create({
                                    courseTitle: course,
                                    semester: semester,
                                    contact: taContact,
                                    description: taDescription,
                                    spaces: spaces,
                                    creator: req.session.username
                                }, function(err, result) {
                                    if (err) res.json(handleError(err, "TA posting"));
                                    else {
                                        res.json({
                                            status: 0, 
                                            response: 'Creating a posting!', 
                                            taPosting: {
                                                course: course,
                                                semester: semester,
                                                id: result._id
                                            }
                                        });
                                    }
                                });
                            } else {
                                console.log("found a course posting!")
                                res.json({ status: 1, response: 'TA posting exists already! Please update it'});
                            }
                        })
                        .catch(err=>{
                            console.log(err)
                            res.json({ status: 2, response: 'Error accessing TAP database! Try again later!' });
                        });
                } else {
                    console.log('No match! :(');
                    res.json({ status: 1, response: "Invalid course or semester!"});
                }
            })
            .catch(err=>{
                console.log(err);
                res.json({ status: 2, response: 'Error accessing Course database! Try again later!' });
            });
    } else {
        // On err, render 403 err and redirect
        res.status(403).render();
        res.redirect('/dashboard');
    }
});

// TODO: Implement this route
router.post('/addAward', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const {
            awardTitle,
            date,
            recipient,
            awardDescription
        } = req.body;
        Award.findOne({
            "$and": [
                {title: awardTitle},
                {recipient: recipient}
            ]})
            .then(award => {
                if (award){
                    console.log("Award exists!");
                    res.json({ status: 1, response: 'Award exists! Please modify the existing award!' });
                } else {
                    console.log("Creating award");
                    Award.create({
                        title: awardTitle,
                        date: date,
                        recipient: recipient,
                        description: awardDescription,
                        creator: req.session.username
                    }, (err, result)=>{
                        if (err) res.json(handleError(err, "award"))
                        else {
                            res.json({
                                status: 0, 
                                response: 'Award created!',
                                eventTitle: {
                                    title: awardTitle,
                                    recipient: recipient,
                                    id: result._id
                                }
                            });
                        }
                    } );
                } 
            })
            .catch(err => {
                console.log(err);
                res.json({ status: 2, response: 'Error accessing database! Try again later!' });
            })

        console.log("Sent response");
    } else {
        // On err, render 403 err and redirect
        res.status(403).render();
        res.redirect('/dashboard');
    }
});

// TODO: Implement this route
router.post('/addNews', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        /** 
         * Not enforcing unique names for the articles.
         * Return object Id for rendering of article
         */
        const {
            newsType,
            newsTitle,
            newsStartdate,
            newsEnddate,
            newsContact, 
            newsDescription 
        } = req.body;
        
        News.create({
            faculty: newsType,
            title: newsTitle,
            start: newsStartdate,
            end: newsEnddate,
            contact: newsContact,
            description: newsDescription,
            creator: req.session.username
        }, (err, result) =>{
            if (err) res.json({ status: 2, response: 'Error accessing database! Try again later!' });
            else {
                res.json({
                    status: 0, 
                    response:'News article created!',
                    article:  {title: newsTitle, id:  result._id}
                });
            }
        });
        console.log("Sent response");
    } else {
        // On err, render 403 err and redirect
        res.status(403).render();
        res.redirect('/dashboard');
    }
});

// TODO: Implement this route
router.post('/addEvent', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        // Search for an event which already exists
        const {eventType, eventTitle, eventStartdate, eventEnddate, host, eventDescription} = req.body;
        Event.findOne({
            "$and": [
                {title: eventTitle},
                {start: eventStartdate},
                {eventType: eventType}
            ]
        })
            .then(event => {
                // Check the existance of the event
                if (event){
                    console.log("Event already Exists!");
                    res.json({ status: 1, response:  'Event exists. Please update it!'});
                } else {
                    console.log("No event found!");
                    // Create the event 
                    Event.create({
                        eventType: eventType,
                        title: eventTitle,
                        start: eventStartdate,
                        end: eventEnddate,
                        hostedBy: host,
                        description: eventDescription,
                        creator: req.session.username
                    }, (err, result) => {
                        if (err) res.json(handleError(err, 'event'));
                        else {
                            res.json({
                                status: 0, 
                                response: 'Event created!',
                                event: { eventTitle: eventTitle, id: result._id }
                            })
                        }
                    });
                }
            })
            .catch(err=>{
                console.log(err);
                res.json({status: 2, response: 'Error accessing database! Try again later!'});
            });
        console.log("Sent response");
    } else {
        // On err, render 403 err and redirect
        res.status(403).render();
        res.redirect('/dashboard');
    }
});

// TODO: Implement this route
router.post('/addTech', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const user = req.session.username;
        const { techTitle, techContact, techDescription } = req.body
        // Can have two tech report postings which are essentially identical. Simply checking if 
        // Someone is trying to readd the same technical report (ie same everything by same creator.) 
        TechnicalReport.findOne({
            "$and" : [
                {title : techTitle},
                {createdBy: user},
            ]
        })
            .then(report => {
                if (report){
                    console.log("Found report of same name by same user!");
                    res.json({status: 1, response: 'This report has already been submitted!'});
                } else {
                    console.log("New report to be submited!");
                    TechnicalReport.create({
                        title: techTitle,
                        creator: user,
                        contact: techContact,
                        description: techDescription,
                        reportDate: Date.now(),
                        editors: [],
                        lastEdited: Date.now()
                    }, (err, result) => {
                        if (err) res.json(handleError(err, "report"));
                        else {
                            res.json({
                                status: 0, 
                                response: 'New technical report created!',
                                report: {title: techTitle, id: result._id}
                            });
                        }
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.json({status: 2, response: 'Error accessing database! Try again later!'});
            })
        console.log("Sent response");
    } else{
        // On err, render 403 err and redirect
        res.status(403).render();
        res.redirect('/dashboard');
    }
});
// TODO: Implement this route
router.post('/addPosting', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        // setting params
        const { 
            postingType,
            postingTitle,
            postingStartdate,
            postingEnddate,
            postingContact,
            postingDescription
        }  = req.body; 
        
        Posting.create({
            faculty:postingType,
            title: postingTitle,
            start: postingStartdate,
            end: postingEnddate,
            contact: postingContact,
            description: postingDescription,
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
    } else{
        // On err, render 403 err and redirect
        res.status(403).render();
        res.redirect('/dashboard');
    }
});

/** 
 * TODO: Fix the Courses "Add" button in order to create a new Course.
 * Maybe we could use a scraper in order to scrape the courses for CS off the McGill website? 
 */
router.post('/addCourse', (req, res)=>{ 
    if (req.session.authenticated){
        Course.create(req.body, (err, content) => {
            if (err) res.json(handleError(err, 'course'));
            else {
                console.log(content);
                res.json({
                    status: 0,
                    response: 'Course created!',
                    posting: {title: content.title, id: content._id}
                });
            }
        });
    }else{
        // On err, render 403 err and redirect
        res.status(403).render();
        res.redirect('/dashboard');
    }
});

module.exports = router;


