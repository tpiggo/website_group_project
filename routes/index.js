const express = require('express');
const router = express.Router();
const middleware = require("../middleware");
const common = require("../common.js");
const User = require('../models/User.js');
const Course = require('../models/Courses');
const Event = require('../models/Events');
const Subpage = require("../models/Subpage");
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const TAPosting = require('../models/TAPosting');
const Award = require('../models/Award');
const { Model, connection } = require('mongoose');
const bcrypt = require('bcrypt');
const Page = require('../models/Page');

router.get('/', (req, res) => {
    res.render('homepage', { logged: req.session.authenticated, username: req.session.username });
});

router.get('/dashboard', middleware.isAuthenticated, (req, res) => {
    // Set content

    User.findOne({ username: req.session.username }, (err, user) => {
        if (err) {
            console.error(err);
            res.send("error when accessing the User Database");
        } else {
            res.render('dashboard', { logged: req.session.authenticated, user: user })
        }
    });

});

/**
 * Settings route
 */
// Adding the settings route
router.get('/settings', middleware.isAuthenticated,  (req, res)=>{
    User.findOne({username: req.session.username})
        .then(user=>{
            if (user){
                // Evidently if the user is logged in, this path should be the only one to be executed
                const {username, email} = user;
                const title = "Settings";
                content = {"html": "./partials/settings",  "script": "<script src='/js/settings.js'></script>"}
                // Render a subpage with the error
                res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username, email: email})
            } else {
                // This shouldn't occur if the user is logged in, but protecting against errors
                const title = "Error!";
                content = {"html": "./partials/user-error"}
                // Render a subpage with the error
                res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username})
            }
        })
        .catch(err=>{
            console.log(err);
            const title = "Error!";
            content = {"html": "./partials/user-error"}
            // Render a subpage with the error
            res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username})
        });
});


router.post('/settings', middleware.isAuthenticated, (req, res)=>{
    
    console.log("Received update for a user!");
    // This shouldn't occur if the user is logged in, but protecting against errors
    console.log(req.body);
    const mUser = req.session.username;
    const {username, password, confPassword, curPassword, email } = req.body;
    /**
     * @description Finds a user within the database
     * @param {String} username
     * @returns {Promise} 
     */
    function findUser(username){
        var errors = [];
        return new Promise((resolve, reject) => {
            User.findOne({username: username}, (err, user) =>{
                if (err){
                    console.error(err);
                    errors.push({msg: "Error during connection!"});
                    reject(errors);
                } else {
                    resolve(user);
                }
            })
        });
    }

    /**
     * @description updates a given users information
     * @param {User} user 
     * @returns {Promise}
     */
    function updateUser(user){
        return new Promise((resolve, reject) => {
            var errors = [];
            if (bcrypt.compareSync(curPassword, user.password)){
                if (username != user.username && username != '') {
                    user.username = username;
                    req.session.username = username;
                }
                if ( user.email != email && email != '') user.email = email
                if (password != '' && confPassword != '') {
                    // update the passwords
                    const mPass = bcrypt.hashSync(req.body.password,10);
                    user.password = mPass;
                }
                // Saving the username into the session, potentially not the greatest solution, but works for now
                req.session.authenticated = true;
                user.save((err) =>{
                    if (err) { 
                        console.error(err);
                        errors.push({msg: 'Error during connection! Try again!'});
                        reject({errors, user});
                    }
                });
                resolve({success: {msg: "Successfully updated!"}, user});
            } else {
                errors.push({msg: 'Wrong password! Try again!'});
                reject({errors, user});
            }
        });
    }

    // Find and update user
    findUser(mUser)
        .then(user => {
            return updateUser(user)
        })
        .then(result => {
            // Success messages in success.msg
            const title = "Settings";
            content = {"html": "./partials/settings",  "script": "<script src='/js/settings.js'></script>"}
            // Render a settings page with the error
            const user = result.user;
            return res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username, email: user.email});
        })
        .catch(result => {
            const title = "Settings";
            content = {"html": "./partials/settings",  "script": "<script src='/js/settings.js'></script>"}
            // Render a settings page with the error
            const user = result.user;
            console.log(result);
            const errors = result.errors;
            return res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username, email: user.email, errors});
        });
});

/**
 * The search bar route.
 */
router.get('/search', (req, res) => {
    // Building Generic search of the site
    let searchQuery = {'$regex': req.query.searched, '$options': 'i'};
    const logged = req.session.authenticated;
    const username = req.session.username;
    // Need to create a regex in order to match a query with a modelname, using first 2 words
    const query = req.query.searched;


    //functions which search each table within the database 
    const searchCourses = () =>common.getAllDataWith(Course, {$or: [
        {title: searchQuery},
        {description: searchQuery},
        {termsOffered: searchQuery}
    ]});
    const searchSubpages = () =>common.getAllDataWith(Subpage, {$or: [
        {name: searchQuery},
        {html: searchQuery},
        {markdown: searchQuery}
    ]});
    const searchNews = () => common.getAllDataWith(News, {$or: [
        {type: searchQuery},
        {title: searchQuery},
        {contact: searchQuery},
        {description: searchQuery}
    ]});
    const searchAwards = () => common.getAllDataWith(Award, {$or: [
        {title: searchQuery},
        {contact: searchQuery},
        {recipient: searchQuery},
        {description: searchQuery}
    ]});
    const searchEvents = () => common.getAllDataWith(Event, {$or: [
        {title: searchQuery},
        {hostedBy: searchQuery},
        {eventType: searchQuery},
        {description: searchQuery}
    ]});
    const searchTAPosting = () => common.getAllDataWith(TAPosting, {$or: [
        {title: searchQuery},
        {contact: searchQuery},
        {semester: searchQuery},
        {description: searchQuery}
    ]});
    const searchPosting = () => common.getAllDataWith(Posting, {$or: [
        {title: searchQuery},
        {contact: searchQuery},
        {type: searchQuery},
        {description: searchQuery}
    ]});
    const searchTechRep = () => common.getAllDataWith(TechnicalReport, {$or: [
        {title: searchQuery},
        {contact: searchQuery},
        {creator: searchQuery},
        {description: searchQuery}
    ]});
    
    // Execute all the promises, receiving an array of responses.
    Promise.all([
        searchCourses(),
        searchSubpages(),
        searchNews(),
        searchAwards(),
        searchEvents(),
        searchTAPosting(),
        searchPosting(),
        searchTechRep()
    ])
        .then(result => {
            result.forEach((value) => {
                value.forEach(innerVal => {
                    if (innerVal.modelName == "courses"){
                        let strSplit = innerVal.title.split(' ');
                        innerVal.href = 'academic/courses?query=' + strSplit[0] + '+' + strSplit[1];
                    } else if (innerVal.modelName == 'news'){
                        // Sending to the news page, but we need to have a way to smooth scroll to the proper article.
                        innerVal.href = '/news/all';
                    } else if (innerVal.modelName == 'awards') {
                        // Sending to the awards page, but we need to have a way to smooth scroll to the proper award.
                        innerVal.href = '/news/awards';
                    } else if (innerVal.modelName == 'events') {
                        // Sending to the events page, but we need to have a way to smooth scroll to the proper event.
                        innerVal.href = '/news/events';
                    } else if (innerVal.modelName == 'taposting') {
                        // Sending to the events page, but we need to have a way to smooth scroll to the proper event.
                        innerVal.href = '/news/taposting';
                    } else if (innerVal.modelName == 'taposting') {
                        // Sending to the events page, but we need to have a way to smooth scroll to the proper event.
                        innerVal.href = '/news/events';
                    } else if (innerVal.modelName == 'subpages')
                        innerVal.href = '/' + innerVal.path;
                    console.log(JSON.stringify(innerVal));
                });
            });
            // Providing all the necessary elements to render to searched page
            content = {
                html: './list/search',
                data: result, script: "<script src='/js/search.js'></script>",
                searchQuery: "https://www.google.com/search?q=mcgill+"+req.query.searched.replace(" ","+")
            };
            res.render('subpage', { title: "Search", menu: result.menu, content, logged, username});
        })
        .catch(err => {
            console.error(err);
        });


});

router.get('/searchingTest', (req, res) => {
    // Need to create a regex in order to match a query with a modelname, using first 2 words
    const query = req.query.searched.toLowerCase();
    common.searchModelNames('events')
        .then(results=>{
            console.log(results);
        })
        .catch(err => {
            console.error(err);
        })
    res.send("TESTING");
});



module.exports = router;