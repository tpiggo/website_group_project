const express = require('express');
const router = express.Router();
const app = express();
const bcrypt = require('bcrypt');
const Page = require('../models/Page.js');
const Subpage = require('../models/Subpage.js');
const User = require('../models/User.js');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

router.post('/login', (req, res)=> {
    var username = req.body.username;
    var password = req.body.password;
    var userModel = User.findOne({name: username}, (err,user) => {
        if(err){ 
            console.log(err);
        }else if(user){
            console.log(bcrypt.compareSync(password,user.password));
        }else{
            console.log("No user with Username: " + username + " found.");
        }
    });
});

router.post('/register', (req, res)=> {
    var password = bcrypt.hashSync(req.body.password,10);
    var user = new User({
        name: req.body.username,
        email: req.body.email,
        password: password,
        userType: 0,
        dateOfBirth: req.body.date_of_birth
    });
    user.save((err) => {
        console.log(err);
    });
    
});

module.exports = router;