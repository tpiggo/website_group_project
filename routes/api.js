const express = require('express');
const router = express.Router();
const middleware = require("../middleware");
const common = require("../common");
const User = require('../models/User');
const Course = require('../models/Courses');
const Event = require('../models/Events');
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const Award = require('../models/Award');
const { Model } = require('mongoose');

router.get('/index-info', (req, res) => {
    // Get the events, latest , and postings. Get first 10, and then rest will be on the  
    var getNews = () => common.getAllDataFrom(News);
    var getEvents = () => common.getAllDataFrom(Event);
    var getPosting = () => common.getAllDataFrom(Posting);
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
            const maxStringLength = 200;
            data.forEach((value, index) => {
                newArr.push({name: mapIndex(index), elements: getFirstN(value, 3)});
            });
            newArr.forEach(values => {
                values.elements.forEach(value => {
                    if (value.description.length > maxStringLength){
                        value.description = value.description.slice(0, maxStringLength) +'...';
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

router.get('/dashboard-info', middleware.isAuthenticated, (req, res) => {
    console.log('request received for dropdowns');
    var getCourses = () => common.getAllDataFrom(Course);
    var getNews = () => common.getAllDataFrom(News);
    var getEvents = () => common.getAllDataFrom(Event);
    var getAwards = () => common.getAllDataFrom(Award);
    var getTech = () => common.getAllDataFrom(TechnicalReport);
    var getPosting = () => common.getAllDataFrom(Posting);

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

module.exports = router;