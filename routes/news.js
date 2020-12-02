const express = require('express');
const router = express.Router();
const common = require("../common.js");
const News = require('../models/News');
const Award = require('../models/Award');

router.get('/all', (req, res) => {
    var title = "News";
    var menu = [['news/all', 'All'], ['news/announcements', 'Announcements'], ['news/awards', 'Awards']];
    const logged = req.session.authenticated;
    const username = req.session.username;

    common.getAllDataFrom(News).then(allNews => {
        var content = { html: './list/news', data: allNews };
        res.render('subpage.ejs', { title, menu, content, logged, username });
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});

router.get('/awards', (req, res) => {
    var title = "News";
    var menu = [['news/all', 'All'], ['news/announcements', 'Announcements'], ['news/awards', 'Awards']];
    const logged = req.session.authenticated;
    const username = req.session.username;

    common.getAllDataFrom(Award).then(awards => {
        var content = { html: './list/awards', data: awards };
        res.render('subpage.ejs', { title, menu, content, logged, username });
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});

router.get('/announcements', (req, res) => {
    var title = "News";
    var menu = [['news/all', 'All'], ['news/announcements', 'Announcements'], ['news/awards', 'Awards']];
    const logged = req.session.authenticated;
    const username = req.session.username;

    common.getAllDataWith(News, {type:'announcements'}).then(news => {
        var content = { html: './list/news', data: news };
        res.render('subpage.ejs', { title, menu, content, logged, username });
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});
module.exports = router;