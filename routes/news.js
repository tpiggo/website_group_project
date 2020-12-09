const express = require('express');
const router = express.Router();
const common = require("../common.js");
const News = require('../models/News');
const Award = require('../models/Award');
//Route for retreiving all news entries
router.get('/all', (req, res) => {
    var title = "News";
    const logged = req.session.authenticated;
    const username = req.session.username;

    var data;
    common.getAllDataFrom(News).then(allNews => {
        var content = { html: './list/news', data: allNews };
        data = { title, content, logged, username, theme: req.session.theme};
        return common.getNavBar();
    }).then(pages => {
        res.render('subpage.ejs', {...data, type: 'all',navbar: pages.navbar});
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});
//Route for retrieving all award news
router.get('/awards', (req, res) => {
    var title = "News";
    const logged = req.session.authenticated;
    const username = req.session.username;

    var data;
    common.getAllDataFrom(Award).then(awards => {
        var content = { html: './list/awards', data: awards };
        data = { title, content, logged, username, theme: req.session.theme};
        return common.getNavBar();
    }).then(pages => {
        res.render('subpage.ejs', {...data,type: 'awards', navbar: pages.navbar});
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});
//Route for retreiving all announcements
router.get('/announcements', (req, res) => {
    var title = "News";
    const logged = req.session.authenticated;
    const username = req.session.username;

    common.getAllDataWith(News, {type:'announcement'}).then(news => {
        var content = { html: './list/news', data: news };
        data = { title, content, logged, username, theme:req.session.theme };
        return common.getNavBar();
    }).then(pages => {
        res.render('subpage.ejs', {...data,type:'announcements',navbar: pages.navbar});
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});
module.exports = router;