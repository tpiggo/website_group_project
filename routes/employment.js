const express = require('express');
const router = express.Router();
const common = require("../common.js");
const Posting = require('../models/Posting');

router.get('/:pagename', (req, res) => {
    var title = "Employement";
    var menu = [['employment/faculty', 'Faculty'], ['employment/lecturer', 'Course Lecturer'], ['employment/research', 'Research'],['employment/student', 'Student']];
    const logged = req.session.authenticated;
    const username = req.session.username;

    common.getAllDataWith(Posting, { type: req.params.pagename }).then(posts => {
        var content= { html: './list/posting', data:posts};
        res.render('subpage.ejs', {
            type:req.params.pagename,
            title,
            menu,
            content,
            logged,
            username,
            theme: req.session.theme
        });
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});
module.exports = router;