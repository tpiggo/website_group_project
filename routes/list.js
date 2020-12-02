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
        var content;
        common.getAllDataFrom(News).then(allNews => {
            //res.send("request received !");
            content = { html: './news', data:allNews};
            res.render('list/list-layout.ejs', { title, menu, content, logged, username });
        }).catch(err => {
            console.error(err);
            res.send(err);
        });
    }
    else if (req.params.pagename == "awards") {
        common.getAllDataFrom(Award).then(awards => {
            content= { html: './awards', data:awards};
            res.render('list/list-layout.ejs', { title, menu, content, logged, username });
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
        var content= { html: './postings', data:posts};
        res.render('list/list-layout.ejs', { type:req.params.pagename, title, menu, content, logged, username });
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