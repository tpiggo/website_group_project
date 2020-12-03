const express = require('express');
const router = express.Router();
const middleware = require("../middleware");
const common = require("../common.js");
const User = require('../models/User.js');
const Course = require('../models/Courses');
const Event = require('../models/Events');
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const Award = require('../models/Award');
const { Model } = require('mongoose');
const bcrypt = require('bcrypt');

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
        })
});

module.exports = router;