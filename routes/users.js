const express = require('express');
const router = express.Router();
const Page = require('../models/Page.js');
const Subpage = require('../models/Subpage.js');


router.get('/login', (req, res)=>{
    const title = "Login";
    var content = {"html": 'login.ejs'};
    const menu = [];
    res.render('lr-layout.ejs', {title, menu, content, "logged": false});
});
router.get('/register', (req, res)=>{
    const title = "Register";
    var content = {"html": 'register.ejs'};
    res.render('lr-layout.ejs', {title, content, "logged": false});
});

module.exports = router;