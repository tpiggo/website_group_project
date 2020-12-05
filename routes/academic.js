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
            courses = mergeSortCourses(result);
            courses = fixCourses(courses);
            return common.getPagesMenu('academic');
        })
        .then(result => {
            var queryCourses = [];
            if (query != undefined){
                if (query=='all'){
                    queryCourses = courses;
                } else {
                    queryCourses = findCourse(query, courses);
                }
            }
            console.log(queryCourses);
            content = { html: './list/courses', data: courses, query: query, queryCourses: queryCourses};
            res.render('subpage', { title, menu: result.menu, content, logged, username});
        })
        .catch(err => {
            console.error(err);
            content = {html: 'user-error', data: 'error'};
            res.render('subpage', { title, menu: result.menu, content, logged, username});
        });
});

/**
 * @description Takes an array of courses and sorts them
 * @param {Array} pArr 
 */
function mergeSortCourses(pArr){
    if (pArr.length <= 1) {
        return pArr;
    }
    var mid = Math.floor(pArr.length/2);
    var lArr = pArr.slice(0, mid);
    var rArr = pArr.slice(mid);
    lArr = mergeSortCourses(lArr);
    rArr = mergeSortCourses(rArr);
    return merge(lArr, rArr); 
}

/**
 * @description Merges two sorted arrays, returns a sorted array
 * @param {Array} lArr 
 * @param {Array} rArr 
 */
function merge(lArr, rArr){
    var i = 0, k = 0; 
    var arr = [];
    while( i < rArr.length && k < lArr.length){
        var rCode = parseInt(rArr[i].title.split(" ")[1]);
        var lCode = parseInt(lArr[k].title.split(" ")[1]);
        if (rCode < lCode) {
            arr.push(rArr[i]);
            i++;
        } else {
            arr.push(lArr[k]);
            k++;
        }
    }
    while (i < rArr.length){
        arr.push(rArr[i]);
        i++;
    }
    
    while (k < lArr.length){
        arr.push(lArr[k]);
        k++;
    }
    return arr;
}
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

function findCourse(courseTitle, courses){
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