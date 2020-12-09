const express = require('express');
const router = express.Router();
const common = require("../common.js");
const Posting = require('../models/Posting');

//Route for obtaining employment postings of a given type
router.get('/:pagename', (req, res) => {
    var title = "Employment";
    const logged = req.session.authenticated;
    const username = req.session.username;

    var data;
    common.getAllDataWith(Posting, { type: req.params.pagename }).then(posts => {
        var content= { html: './list/posting', data:posts};
        data= {
            type:req.params.pagename,
            title,
            content,
            logged,
            username,
            theme: req.session.theme
        };
        return common.getNavBar();
    }).then(pages => {
        res.render('subpage.ejs', {...data, navbar: pages.navbar});
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});
module.exports = router;