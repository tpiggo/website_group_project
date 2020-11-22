const express = require('express');
const router = express.Router();
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const Page = require('../models/Page.js');
const Subpage = require('../models/Subpage.js');
const User = require('../models/User.js');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

router.get('/login', (req, res)=>{
    const title = "Login";
    var content = {"html": 'login.ejs'};
    const menu = [];
    res.render('lr-layout.ejs', {title, menu, content, logged: req.session.authenticated});
});
router.get('/register', (req, res)=>{
    const title = "Register";
    var content = {"html": 'register.ejs', "script": "<script src='/js/register.js'></script>"};
    res.render('lr-layout.ejs', {title, content, logged: req.session.authenticated});
});

router.post('/login', (req, res)=> {
    var username = req.body.username;
    var password = req.body.password;
    var userModel = User.findOne({name: username}, (err,user) => {
        if(err){ 
            console.log(err);
        }else if(user){
            var authenticated = bcrypt.compareSync(password,user.password);
            if(authenticated){
                console.log("User "+username + " succesfully logged in.");
                req.session.username = username;
                req.session.authenticated = true;
            }else {
                console.log("User "+username + " failed to log in.");
            }
        }else{
            console.log("No user with Username: " + username + " found.");
        }
    });
});

router.post('/register', (req, res)=> {
    var password = bcrypt.hashSync(req.body.password,10);
    var username = req.body.username;
    User.findOne({name: username})
        .then(user=>{
            if (user){
                console.log(username + " is a user.")
            } else {
                console.log(username + " is not a user");
            }
        })
        .catch(err=>console.log(err));
    if(User.exists({name: username})){
        console.log("A user with username:" + username + " already exists.");
        return res.redirect('/users/register');
    }else if(User.exists({email: email})){
        console.log("A user with email:" + email + " already exists.");
        return res.redirect('/users/register');
    }
    var user = new User({
        name: username,
        email: req.body.email,
        password: password,
        userType: 0,
        dateOfBirth: req.body.date_of_birth
    });
    user.save((err) => {
        if(err) {console.log(err);}
    });
    
});

module.exports = router;