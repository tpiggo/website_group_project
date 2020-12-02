const express = require('express');
const router = express.Router();
const common = require("../common.js");
const Course = require('../models/Courses');
const Event = require('../models/Events');
const News = require('../models/News');
const TechnicalReport = require('../models/TechnicalReport');
const Posting = require('../models/Posting');
const Award = require('../models/Award');

router.get('/news/:pagename', (req, res) => {
    var title = "News";
    var menu = [['all', 'All'], ['announcements', 'Announcements'], ['awards', 'Awards']];
    const logged = req.session.authenticated;
    const username = req.session.username;

    if (req.params.pagename == "all") {
        common.getAllDataFrom(News).then(allNews => {
            //res.send("request received !");
            res.render('list/news.ejs', { title, menu, content: allNews, logged, username });
        }).catch(err => {
            console.error(err);
            res.send(err);
        });
    }
    else if (req.params.pagename == "awards") {
        common.getAllDataFrom(Award).then(awards => {
            res.render('list/awards.ejs', { title, menu, content: awards, logged, username });
        }).catch(err => {
            console.error(err);
        res.send(err);
        });
    }
});

router.get('/employement/:pagename', (req, res) => {
    console.log("EMPLOYEMENT")
    console.log("EMPLOYEMENT")
    var title = "Employement";
    var menu = [['faculty', 'Faculty'], ['lecturer', 'Course Lecturer'], ['research', 'Research'],['student', 'Student']];
    const logged = req.session.authenticated;
    const username = req.session.username;

    common.getAllDataWith(Posting, { type: req.params.pagename }).then(posts => {
        res.render('list/posting.ejs', { type:req.params.pagename, title, menu, content: posts, logged, username });
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});

//TO DO :
/* implement route for courses and tech reports
 * 
*/

module.exports = router;