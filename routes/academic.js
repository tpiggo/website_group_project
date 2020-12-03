const express = require('express');
const router = express.Router()
const common = require('../common');
const Courses = require("../models/Courses");

router.get('/courses', (req, res) => {
    const logged = req.session.authenticated;
    const username = req.session.username;
    const title = "Courses";
    const getCourses = () => common.getAllDataFrom(Courses);
    getCourses()
        .then(result => {
            result = mergeSortCourses(result);
            console.log(result);
            content = { html: './courses', data: result};
            res.render('list/list-layout.ejs', { title, menu: [], content, logged, username});
        })
        .catch(err => {
            console.error(err);
            res.send('404: Tim made a mistake');
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
        var rCode = parseInt(rArr[i].title.slice(5, 8));
        var lCode = parseInt(lArr[k].title.slice(5, 8));
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

module.exports = router;