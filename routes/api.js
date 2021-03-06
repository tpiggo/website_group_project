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
const fs = require('fs');
const path = require('path');
const Courses = require('../models/Courses');
const bodyParser = require('body-parser');
const Subpage = require('../models/Subpage');
const Page = require('../models/Page');
const UserRequests = require('../models/UserRequest');
const markdown = require('markdown-it')('commonmark');

//root for getting the latest happenings for the frontpage to display
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
            var newArr = [];
            const maxStringLength = 200;
            data.forEach((value, index) => {
                newArr.push({name: mapIndex(index), elements: getFirstN(value, 5)});
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

//Route that gets all the info needed to render the dashboard
router.get('/dashboard-info', middleware.isAuthenticated, (req, res) => {
    var getCourses = () => common.getAllDataFrom(Course);
    var getNews = () => common.getAllDataFrom(News);
    var getEvents = () => common.getAllDataFrom(Event);
    var getAwards = () => common.getAllDataFrom(Award);
    var getTech = () => common.getAllDataFrom(TechnicalReport);
    var getPosting = () => common.getAllDataFrom(Posting);
    var getSubpages = () => common.getAllDataFrom(Subpage);
    var getPages = () => common.getAllDataFrom(Page);
    Promise.all([getCourses(), getNews(), getEvents(), getAwards(), getTech(), getPosting(), getSubpages(), getPages()])
        .then(data => {
            res.json({ status: 0, data });
        }).catch(err => {
            console.error(err);
            res.json({ status: 2, response:"error while fecthing data from db"});
        });

});

//Route for getting the syllabus of a given course
router.get('/courses/syllabus/:courseName', (req, res) =>{
    // Fix the course name
    let pCourse =  req.params.courseName.replace('-', " ");
    Course.findOne({title: { '$regex': pCourse, '$options': 'i' }})
        .then(course => {
            if (!course){
                console.log("No course found! Error");
                return res.send('Error loading course page: No course found!');
            }
            if (course.syllabus == "noFile"){
                return res.send('No file is here! Sorry <a href="/">Home</a>');
            }
            let filePath = path.join(__dirname, '../files/', course.syllabus);
            let stats = fs.statSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Length': stats.size
            });
            var readStream = fs.createReadStream(filePath);
            // Replace event handlers with readStream.pipe()
            readStream.pipe(res);
            return;
        })
        .catch(err=>{
            console.error(err);
            return res.send('Error loading course page');
        });
});
//Route for getting the list of user requests for upgraded permissions
router.get('/user-requests', (req, res) =>{ 

    common.getAllDataFrom(UserRequests).then(requests => {
        res.send({ status: 0, requests});
    }).catch(err => {
        console.error(err);
        res.send({ status: 1, response:'"Error Fetching the user requests"' });
    })

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
//Route for getting information about a specific course
router.get('/getCourse', (req, res) => {
    const classTitle = req.query.class;
    if (classTitle == "all"){
        Courses.find()
            .then(results => {
                if (results.length > 0){
                    // Need to check if this is already a link. Courses syllabus can be a link or a file  
                    for (let result of results){
                        if (result.syllabus != undefined){
                            result.syllabus = '/api/courses/syllabus/comp-' + result.title.split(" ")[1];
                        }
                        // Hide the database ID
                        result._id = null;
                    }
                    results = common.mergeSortCourses(results);
                    res.json({
                        response: results,
                        status: 0
                    });
                } else {
                    res.json({
                        response: 'Error: No course found!',
                        status: 1
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.json({
                    response: "Internal Server Error.",
                    status: 2
                });
            });
    } else {
        Courses.findOne({title: classTitle})
        .then(result => {
            if (result) {
                // Need to check if this is already a link. Courses syllabus can be a link or a file  
                if (result.syllabus != undefined){
                    result.syllabus = '/api/courses/syllabus/comp-' + result.title.split(" ")[1];
                }
                // Hide the database ID
                result._id = null;
                res.json({
                    response: result,
                    status: 0
                });
            } else {
                res.json({
                    response: 'Error: No course found!',
                    status: 1
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.json({
                response: "Internal Server Error.",
                status: 2
            });
        });
    }
    
});

// Giving access to bodyparser from this moment on
router.use(bodyParser.json());
//Route for rendering markdown and returning the HTML(used for editor preview)
router.post('/render-markdown', (req, res) => {
    Promise.resolve(markdown.render(req.body.markdown))
    .then(data => {
        res.json({ status: 0, data });
    }).catch(err => {
        console.error(err);
        res.json({ status: 2, response:"error while rendering markdown"});
    });
});

module.exports = router;