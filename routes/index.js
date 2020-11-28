const express = require('express');
const router = express.Router();
const middleware = require("../middleware");
const User = require('../models/User.js');
const Course = require('../models/Courses');
const Event = require('../models/Events');
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const Award = require('../models/Award');

router.get('/', (req, res) => {
    res.render('homepage', { logged: req.session.authenticated, username: req.session.username });
});

router.get('/dashboard', middleware.isAuthenticated, (req, res) => {
    // Set content

    function getCurrentUser() {
        return new Promise((resolve, reject) => {
            User.findOne({ username: req.session.username }, (err, user) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    }
    function getAllDataFrom (Model) {
        return new Promise((resolve, reject) => {
            Model.find({}, (err, content) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
    }

    var getCourses = () => getAllDataFrom(Course);
    var getNews = () => getAllDataFrom(News);
    var getEvents = () => getAllDataFrom(Event);
    var getAwards = () => getAllDataFrom(Award);
    var getTech = () => getAllDataFrom(TechnicalReport);
    var getPosting = () => getAllDataFrom(Posting);

    Promise.all([getCurrentUser(), getCourses(), getNews(), getEvents(), getAwards(), getTech(), getPosting()])
        .then(data => {
            var user = data[0];
            var pages ={
                courses: data[1],
                news: data[2],
                events: data[3],
                awards: data[4],
                techs: data[5],
                postings: data[6]
            };
        console.log("sending all the data found to user");
        res.render('dashboard', { logged: req.session.authenticated, user: user, pages: pages})
    }).catch(err => {
            console.log(err);
        });

});
module.exports = router;