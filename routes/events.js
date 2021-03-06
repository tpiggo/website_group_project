const express = require('express');
const router = express.Router();
const common = require("../common.js");
const Event = require('../models/Events');

//Route for obtaining all events
router.get('/all', (req, res) => {
    var title = "Events";
    const logged = req.session.authenticated;
    const username = req.session.username;

    var data;
    common.getAllDataFrom(Event).then(events => {
        //res.send("request received !");
        var content = { html: './list/events', data: events };
        data = { type: req.params.pagename, title, content, logged, username, theme: req.session.theme };
        return common.getNavBar();
    }).then(pages => {
        res.render('subpage.ejs', {...data, navbar: pages.navbar});
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});

//Route for obtaining events of a specific type
router.get('/:pagename', (req, res) => {
    var title = "Events";
    const logged = req.session.authenticated;
    const username = req.session.username;

    common.getAllDataWith(Event, { eventType: req.params.pagename }).then(events => {
        var content = { html: './list/events', data: events };
        data = { type: req.params.pagename, title, content, logged, username, theme: req.session.theme };
        return common.getNavBar();
    }).then(pages => {
        res.render('subpage.ejs', {...data, navbar: pages.navbar});
    }).catch(err => {
        console.error(err);
        res.send(err);
    });

});

module.exports = router;