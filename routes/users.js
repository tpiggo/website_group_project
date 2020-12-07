const express = require('express');
const router = express.Router();
const app = express();
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const { isAuthenticated, canUseRoute } = require('../middleware');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

router.get('/login', canUseRoute, (req, res)=>{
    const title = "Login";
    const content = {"html": 'partials/login.ejs', "script":""};
    const menu = [];
    return res.render('user-layout', {
        title,
        menu,
        content,
        logged: req.session.authenticated,
        user: req.session.username,
        theme: req.session.them
    });
});
router.get('/register', canUseRoute, (req, res)=>{
    const title = "Register";
    const content = {"html": 'partials/register.ejs', "script": "<script src='/js/register.js'></script>"};
    return res.render('user-layout', {
        title,
        content,
        logged: req.session.authenticated,
        user: req.session.username,
        theme: req.session.theme
    });
});

router.post('/login', canUseRoute, (req, res)=> {
    var username = req.body.username;
    var password = req.body.password;
    var errors = [];
    const title = "Login";
    const content = {"html": 'partials/login.ejs', "script":""};
    User.findOne({username: username}, (err,user) => {
        if(err){ 
            console.log(err);
        }else if(user){
            var authenticated = bcrypt.compareSync(password,user.password);
            if(authenticated){
                console.log("User "+ username + " succesfully logged in.");
                // Saving the username into the session, potentially not the greatest solution, but works for now
                req.session.username = username;
                req.session.authenticated = true;
                req.session.theme = user.userTheme;
                console.log(req.session.theme);
                return res.redirect("/dashboard");
            } else {
                console.log("User "+username + " failed to log in.");
                errors.push({msg: "Wrong username or password!"});
            }
        } else {
            console.log("No user with Username: " + username + " found.");
            errors.push({msg: "Wrong username or password!"});
        }
        return res.render('user-layout', {
            title, 
            menu: [],
            content,
            logged: req.session.authenticated,
            user: req.session.username,
            theme: req.session.theme,
            errors
        });
    }).catch(err=>console.log(err));
});

/**
 * Registration Route
 */
router.post('/register', canUseRoute, (req, res)=> {
    // Is there  a reason for doing it this way?
    var password = bcrypt.hashSync(req.body.password,10);
    const username = req.body.username;
    const email = req.body.email;
    const title = "Register";
    var content = {
            "html": 'partials/register.ejs', 
            "script": "<script src='/js/register.js'></script>"
        };
    /**
     * 
     * @param {*} username 
     * @param {*} email 
     */
    function findUserUnique(username, email){
        return new Promise((resolve, reject) => {
            var errors = [];
            User.find({$or: [{name: username},{email: email}]}, (err, result)=>{
                if (err) {
                    console.error(err);
                    errors.push({msg: "Failure during connection!"});
                    reject(errors)
                }
                else resolve(result)
            })
        });
    }

    /**
     * 
     * @param {*} user 
     */
    function createNewUser(user){
        var errors = [];
        return new Promise((resolve, reject) =>{
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
                reject(errors)
            } else {
                User.create({
                    username: username,
                    email: req.body.email,
                    password: password,
                    userType: 0
                }, (err) => {
                    if (err) {
                        errors.push({msg: "Error during creation"});
                        reject(errors);
                    }
                });
            }
        });
    }

    // Query users from database and add if you find nothing
    findUserUnique(username, email)
        .then(users => {
            return createNewUser(users);
        })
        .then(user => {
            /**
             * @todo: Should get a success message that user was created 
             */
            return res.redirect('/users/register');
        })
        .catch(errors => {
            console.log("Error occurred!")
            return res.render('user-layout', {
                title, 
                content,
                logged: req.session.authenticated,
                user: req.session.user,
                theme: req.session.theme,
                errors
            });
        })
});

/** 
 * Logout Route
 * Can be accessed by the user if they know the route, but nothing will happen if they do not have an active session
*/
router.get("/logout", (req, res)=>{
    // Check if authenticated session exists. 
    if (req.session.authenticated){
        req.session.destroy();
        console.log("Successfully logged out. Redirecting");
    } else {
        console.log("Session not authenticated");
    }
    res.redirect("/");
});


module.exports = router;