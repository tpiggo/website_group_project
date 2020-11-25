const express = require('express');
const router = express.Router();
const User = require('../models/User.js');

router.get('/', (req, res) => {
    res.render('homepage', {logged: req.session.authenticated, user: req.session.username });
});

router.get('/dashboard', (req, res)=>{
    // var title = 'Dashboard'
    if (req.session.authenticated){
        // Set content
        User.findOne({username: req.session.username}, (err,user) => {
            if(err) {
                console.log(err);
            }else {
                const content = {'scripts': "<script src='/js/dashboard.js'></script>"};
                res.render('dashboard', {content, logged: req.session.authenticated, user: req.session.username, type: user.userType})
            }
        });
    } else {
        // Set error page
        const title = "Error!";
        content = {"html": "<h1>You do not have access to this page! Please <a href='/users/login'>Login</a> to view this content</h1>"}
        // Render a subpage with the error
        res.render('subpage', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username,})
    }
   
});
module.exports = router;