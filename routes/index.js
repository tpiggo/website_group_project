const { render } = require('ejs');
const express = require('express');
const router = express.Router();
const session = require('express-session');
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
                content = {"html": "<h1>Welcome "+ req.session.username +" </h1>"}
                res.render('dashboard', {logged: req.session.authenticated, user: req.session.username, type: user.userType})
            }
        });
    } else {
        // Set error page
        // content = {"html": "<h1>You do not have access to this page! Please <a href='/users/login'>Login</a></h1>"}
        res.send("Error : You do not have access to this page! Please <a href='/users/login'>Login</a></h1>")
    }
   
});
module.exports = router;