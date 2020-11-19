const express = require('express');
const router = express.Router();
const Page = require('../models/Page.js');
const Subpage = require('../models/Subpage.js');


router.get('/login', (req, res)=>{
    const title = "Login";
    var content = {"html": 'login.ejs', "read": true};
    const menu = [];
    res.render('subpage.ejs', {title, menu, content});
});
router.get('/register', (req, res)=>{

});

module.exports = router;