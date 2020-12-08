const express = require('express');
const router = express.Router()
const common = require('../common');
const Courses = require("../models/Courses");
const fileSystem = require('fs');

router.get('/courses', (req, res) => {
    const logged = req.session.authenticated;
    const username = req.session.username;
    const title = "Courses";
    var courses;
    // Check if the query is empty! Only possible matches can be all or a course. 
    const {query} = req.query;
    common.getAllDataFrom(Courses)
        .then(result => {
            courses = common.mergeSortCourses(result);
            courses = fixCourses(courses);
            return common.getPagesMenu('academic');
        })
        .then(result => {
            var queryCourses = [];
            if (query != undefined){
                if (query=='all'){
                    queryCourses = courses;
                } else {
                    queryCourses = findCourses(query, courses);
                }
            }
            content = { html: './list/courses', data: courses, query: query, queryCourses: queryCourses};
            res.render('subpage', { title, menu: result.menu, content, logged, username, theme: req.session.theme});
        })
        .catch(err => {
            console.error(err);
            content = {html: 'user-error', data: 'error'};
            res.render('subpage', { title, menu: result.menu, content, logged, username, theme: req.session.theme});
        });
});

/**
 * 
 * @param {Array} courses 
 */
function fixCourses(courses){
    var mArr = []
    courses.forEach((value)=>{
        var stringSplit = value.title.split(" ");
        value["mClass"] = stringSplit[0] + '-' + stringSplit[1];
        if (value.syllabus != undefined){
            value.syllabus = '/api/courses/comp-' + stringSplit[1];
        }
        mArr.push(value);
    });
    return mArr;
}

function findCourses(courseTitle, courses){
    const regex = new RegExp(courseTitle, "i");
    var found = [];
    courses.forEach((value) => {
        if (regex.exec(value.title)){
            found.push(value);
        }
    });
    return found;
}

module.exports = router;