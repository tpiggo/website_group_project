const { response } = require('express');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const TAPosting = require('../models/TAPosting'); 
const Course = require('../models/Courses'); 
const Event = require('../models/Events');
const News = require('../models/News');
// Body parser for these routes. Needed since sending JSONs to and from the frontend.
router.use(bodyParser.json());
/**
 * Dashboard forms 
 */

// Add TA form
router.post('/addTA', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        var semester;
        const aReq = req.body;
        aReq.course = aReq.course.toUpperCase();
        if (aReq.semester.includes('f')) semester = aReq.semester.replace('f', "Fall ");
        else if (aReq.semester.includes('w')) semester = aReq.semester.replace('w', "Winter ");
        else if (aReq.semester.includes('s')) semester = aReq.semester.replace('s', "Summer "); 
        // Last logical is up for changing depending on how we maintain summer semester (since there are 2)
        console.log(semester);
        // Query to find a course which contains the same name during the same semester
        //{title: {'$regex': aReq.course, '$options': 'ix'}}, 
        Course.find({"$and": [
            {title: {'$regex': aReq.course, '$options': 'ix'}}, 
            {termsOffered: semester}
        ]})
            .then(result => {
                console.log(result);
                if (result.length > 0){
                    console.log("Found a match!")
                    
                    // Given there is a course in the courses database, we can move on to checking if
                    // There exists a TAPosting for this course for that semester. If not we can go ahead and post one!
                    TAPosting.findOne({'$and': [
                        { courseTitle : aReq.course }, 
                        { semester: aReq.semester }
                    ]})
                        .then(coursePosting=>{
                            // Checks if there was a posting found
                            if (!coursePosting){
                                console.log("creating posting!")
                                const mPosting = new TAPosting({
                                    courseTitle: aReq.course,
                                    semester: aReq.semester,
                                    contact: aReq.taContact,
                                    description: aReq.taDescription,
                                    spaces: aReq.spaces
                                });
                                mPosting.save()
                                    .then(()=>res.json({ response : "Creating the posting for the course!"}))
                                    .catch(err=>{
                                        console.log(err);
                                        res.json({ response : "Error adding the course!"});
                                    });
        
                            } else {
                                console.log("found a course posting!")
                                res.json({ response : "Course Posting exists already!"});
                            }
                        })
                        .catch(err=>{
                            console.log(err)
                            res.json({ response : "Error while adding course!"});
                        });
                } else {
                    console.log('No match! :(')
                    res.json({ response : "Invalid course!"});
                }
            })
            .catch(err=>{
                console.log(err);
                res.json({ response : "Error while finding course!"});
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
        const response = {request: 'AddAward request'};
        res.json(response);
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
        /** Not enforcing unique names for the articles.
         * Could run into problems later if there are articles of the same name (maybe)
         * This problem has two solutions: Hide the objectId within the page in order to know what article
         * we are trying to access OR use the description as the tool to get the article.
         */
        console.log(req.body);
        const pArticle = new News({
            faculty: req.body.newsType,
            title: req.body.newsTitle,
            start: req.body.newsStartdate,
            end: req.body.newsEnddate,
            contact: req.body.newsContact,
            description: req.body.newsDescription
        });
        // save the article, return the proper response
        pArticle.save()
            .then(()=>res.json({request: 'News article added!'}))
            .catch(err=>{
                console.log(err);
                res.json({request: 'Error adding the article!'});
            })
        res.json({request: 'News article added!'});
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
                    res.json({request: 'Event exists!'});
                } else {
                    console.log("No event found!");
                    // Create the event 
                    const pEvent = new Event({
                        eventType: eventType,
                        title: eventTitle,
                        start: eventStartdate,
                        end: eventEnddate,
                        hostedBy: host,
                        description: eventDescription
                    });
                    // Save event and handle events
                    pEvent.save()
                        .then(()=>res.json({request: 'Event added!'}))
                        .catch(err=>{
                            console.log(err);
                            res.json({request: 'Error adding event!'});
                        });
                }
            })
            .catch(err=>{
                console.log(err);
                res.json({request: 'Error adding event!'});
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
        const response = {request: 'AddTech request'};
        res.json(response);
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
        const response = {request: 'AddPosting'};
        res.json(response);
        console.log("Sent response");
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


module.exports = router;


