const express = require('express');
const router = express.Router();
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('../models/User.js');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

router.get('/login', (req, res)=>{
    const title = "Login";
    const content = {"html": 'login.ejs', "script":""};
    const menu = [];
    res.render('lr-layout.ejs', {title, menu, content, logged: req.session.authenticated, user: req.session.username});
});
router.get('/register', (req, res)=>{
    const title = "Register";
    const content = {"html": 'register.ejs', "script": "<script src='/js/register.js'></script>"};
    return res.render('lr-layout.ejs', {title, content, logged: req.session.authenticated, user: req.session.username});
});

router.post('/login', (req, res)=> {
    var username = req.body.username;
    var password = req.body.password;
    var errors = [];
    const title = "Login";
    const content = {"html": 'login.ejs', "script":""};
    var userModel = User.findOne({username: username}, (err,user) => {
        if(err){ 
            console.log(err);
        }else if(user){
            var authenticated = bcrypt.compareSync(password,user.password);
            if(authenticated){
                console.log("User "+ username + " succesfully logged in.");
                // Saving the username into the session, potentially not the greatest solution, but works for now
                req.session.username = username;
                req.session.authenticated = true;
                return res.redirect("/dashboard");
            } else {
                console.log("User "+username + " failed to log in.");
                errors.push({msg: "Wrong username or password!"});
            }
        } else {
            console.log("No user with Username: " + username + " found.");
            errors.push({msg: "Wrong username or password!"});
        }
        return res.render('lr-layout.ejs', {
            title, 
            menu: [],
            content,
            logged: req.session.authenticated,
            user: req.session.username,
            errors
        });
    }).catch(err=>console.log(err));
});

/**
 * Registration Route
 */
router.post('/register', (req, res)=> {
    // Is there  a reason for doing it this way?
    var password = bcrypt.hashSync(req.body.password,10);
    const username = req.body.username;
    const email = req.body.email;
    const title = "Register";
    var content = {
            "html": 'register.ejs', 
            "script": "<script src='/js/register.js'></script>"
        };
    var errors = [];
    // User query from database
    User.find({$or: [{name: username},{email: email}]}, (err, result)=>{
        if (err) console.log(err);
        else console.log(result)
    }).then(user=>{
        //console.log(user);
        if (user.length > 0){
            user.forEach(item=>{
                if (item.email == email){
                    errors.push({msg: "Email already registered!"});
                }
                if (item.username == username){
                    errors.push({msg: "Username already registered!"});
                }
                console.log(item, email, username);
            });
            console.log("user found!");
            console.log(errors);
            console.log(user);
            return res.render('lr-layout.ejs', {
                title, 
                content,
                logged: req.session.authenticated,
                user: req.session.user,
                errors
            });
        } else{
            // The data has passed the data verification system. Enter it into the database
            var user = new User({
                username: username,
                email: req.body.email,
                password: password,
                userType: 0
            });
            user.save((err) => {
                if(err) {console.log(err);}
            });
            console.log("User was added to the database!!")
        }
        return res.redirect('/users/register');
    }).catch(err=>console.log(err));
});

/** 
 * Logout Route
 * Can be accessed by the user if they know the route, but nothing will happen if they do not have an active session
*/
router.get("/logout", (req, res)=>{
    // Check if authenticated session exists. 
    if (req.session.authenticated){
        req.session.destroy();
    } else {
        console.log("Session not authenticated");
    }
    console.log("Successfully logged out. Redirecting");
    res.redirect("/");
});


module.exports = router;