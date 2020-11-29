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
const { Model } = require('mongoose');

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


router.get('/api/index-info', (req, res) => {
    // Get the events, latest , and postings. Get first 10, and then rest will be on the  
    var getNews = () => getAllDataFrom(News);
    var getEvents = () => getAllDataFrom(Event);
    var getPosting = () => getAllDataFrom(Posting);
    function mapIndex(i){
        if (i == 0) return "news";
        else if (i == 1) return "events";
        else return "postings";
    }

    Promise.all([getNews(), getEvents(), getPosting()])
        .then(data => {
            // Data is an array of arrays
            console.log("Handling firstTen");
            var newArr = [];
            const maxStringLength = 100;
            data.forEach((value, index) => {
                newArr.push({name: mapIndex(index), elements: getFirstN(value, 2)});
            });
            newArr.forEach(value => {
                value.elements.forEach(value => {
                    if (value.description.length > maxStringLength){
                        value.description = value.description.slice(0, maxStringLength);
                    }
                });
            });
            res.json({status: 0, response: newArr});
        })
        .catch(err => {
            console.error(err);
            res.json({ status: 2, response:"Internal Database error"});
        });
});

router.get('/api/dashboard-info', middleware.isAuthenticated, (req, res) => {
    console.log('request received for dropdowns');
    var getCourses = () => getAllDataFrom(Course);
    var getNews = () => getAllDataFrom(News);
    var getEvents = () => getAllDataFrom(Event);
    var getAwards = () => getAllDataFrom(Award);
    var getTech = () => getAllDataFrom(TechnicalReport);
    var getPosting = () => getAllDataFrom(Posting);

    Promise.all([getCourses(), getNews(), getEvents(), getAwards(), getTech(), getPosting()])
        .then(data => {
            console.log('sending all the data to dashboard');
            res.json({ status: 0, data });
        }).catch(err => {
            console.error(err);
            res.json({ status: 2, response:"error while fecthing data from db"});
        });

});

/**
 * @description Given a list of n elements, return the first 10 or the whole thing (if less than 10)
 * @param {*} pArray 
 */
function getFirstN(pArray, maxSize){
    if (pArray.length > maxSize ){
        var items = pArray.slice(0, maxSize);
        return items;
    } else {
        return pArray;
    }
}

/**
 * Get all the data from the collection specified by Model
 * @param {Model} Model indicate the collection to get data from
 * @returns {Promise}
 */
function getAllDataFrom(Model) {
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
module.exports = router;