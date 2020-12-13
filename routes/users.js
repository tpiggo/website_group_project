const express = require('express');
const router = express.Router();
const common = require("../common.js");
const app = express();
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const { isAuthenticated, canUseRoute } = require('../middleware');
const UserRequest = require('../models/UserRequest');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Route for user login page
router.get('/login', canUseRoute, (req, res)=>{
    const title = "Login";
    const content = {"html": 'partials/login.ejs', "script":""};
    const menu = [];
    common.getNavBar().then(pages => { //Load the navbar for the page
        navbar = pages.navbar;
        res.render('user-layout', { //Render the login page
            title,
            menu,
            content,
            logged: req.session.authenticated,
            user: req.session.username,
            theme: req.session.them,
            navbar
        });
    }).catch(err => {
        console.log(err);
        res.send("Error getting navbar from DB");
    });

});
//Route for the registration page
router.get('/register', canUseRoute, (req, res)=>{

    const title = "Register";
    const content = {"html": 'partials/register.ejs', "script": "<script src='/js/register.js'></script>"};

    common.getNavBar().then(pages => {
        navbar = pages.navbar;
        res.render('user-layout', {
            title,
            content,
            logged: req.session.authenticated,
            user: req.session.username,
            theme: req.session.theme,
            navbar
        });
    }).catch(err => {
        console.log(err);
        res.send("Error getting navbar from DB");
    });
});

/**
 * Login route for submitting a login attempt
 */
router.post('/login', canUseRoute, (req, res)=> {

    var username = req.body.username;
    var password = req.body.password;
    var errors = [];
    const title = "Login";
    const content = {"html": 'partials/login.ejs', "script":""};

    common.getUser(username)
        .then(user => {
            bcrypt.compare(password,user.password, (err, authenticated) => { //Hash the submitted password and compare it to the one from the database
                if(authenticated){
                    console.log("User "+ username + " succesfully logged in.");
                    // Saving the username into the session, potentially not the greatest solution, but works for now
                    req.session.username = username;
                    req.session.authenticated = true;
                    req.session.theme = user.userTheme;
                    console.log(req.session.theme);
                    return res.redirect("/dashboard"); //Send to the dashboard if login succeeds 
                } else {
                    throw Error(`userNameError ${username}`);
            }});
        })
        .catch(err => {
            if (err == null){
                console.log("No user with Username: " + username + " found.");
                errors.push({msg: "Wrong username or password!"});
            } else if (err.message.includes('userNameError')){
                let user = err.message.replace("userNameError ", "");
                console.log(`Username ${user} does not exist`);
                errors.push({msg: "Wrong username or password!"});
            } else {
                console.log("Catastrophic error!");
                console.error(err);
                errors.push({msg: "Error accessing database!"});
            }
            common.getNavBar().then(pages => {
                navbar = pages.navbar;
                res.render('user-layout', { //Reload the page if the attempt fails
                    title, 
                    menu: [],
                    content,
                    logged: req.session.authenticated,
                    user: req.session.username,
                    theme: req.session.theme,
                    errors,
                    navbar
                });
            }).catch(err => {
                console.log(err);
                res.send("Error getting navbar from DB");
            });
        });
});

/**
 * Registration Route for submitting a registration attempt
 */
router.post('/register', canUseRoute, (req, res)=> {
    var password = bcrypt.hashSync(req.body.password,10);
    const username = req.body.username;
    const email = req.body.email;
    const title = "Register";
    var content = {
            "html": 'partials/register.ejs', 
            "script": "<script src='/js/register.js'></script>"
        };
    /**
     * Finds a unique user based on their username and email
     * @param {String} username 
     * @param {String} email 
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
     * Creates a user with the given username
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
                User.create({ //Provided no errors occured, create the user
                    username: username,
                    email: req.body.email,
                    password: password,
                    userType: 0
                }, (err, user) => {
                    if (err) {
                        errors.push({msg: "Error during creation"});
                        reject(errors);
                    } else resolve(user)
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
            console.log("Done creating! Redirecting back to register")
            return res.redirect('/users/register');
        })
        .catch(errors => {
            console.log("Error occurred!")

            common.getNavBar().then(pages => {
                navbar = pages.navbar;
                res.render('user-layout', { //If an error occured, reload the registration page
                    title, 
                    content,
                    logged: req.session.authenticated,
                    user: req.session.user,
                    theme: req.session.theme,
                    errors,
                    navbar
                });
            }).catch(err => {
                console.log(err);
                res.send("Error getting navbar from DB");
            });
        })
});

/** 
 * Logout Route
 * Can be accessed by the user if they know the route, but nothing will happen if they do not have an active session
*/
router.get("/logout", isAuthenticated, (req, res)=>{
    // Check if authenticated session exists. 
    req.session.destroy();
    console.log("Successfully logged out. Redirecting");
    res.redirect("/");
});


//Give access to the body parser for this route
router.use(bodyParser.json())

/** USER LEVEL REQUEST */
router.post('/requestLevel', isAuthenticated, (req, res) => {
    /**
     * @description Searches the request table and rejects 
     * @param {String} username 
     * @returns {Promise}
     */
    function requestNotMade(username){
        return new Promise((resolve, reject) => {
            UserRequest.findOne({username: username}, (err, result)=>{
                if (err){
                    reject(err);
                }
                else if ( !result ) {
                    resolve({canMake: true});
                } else {
                    reject({canMake: false});
                }
            });
        });
    }
    /**
     * @description Creates a request with a given user and message
     * @param {User} user 
     * @param {String} message 
     * @returns {Promise}
     */
    function createRequest(user, message){
        return new Promise((resolve, reject) => {
            UserRequest.create({
                username: user.username,
                email: user.email,
                message: message,
                userType: user.userType
            }, (err) => {
                if (err) reject(err);
                else resolve({status: 0, response: "Request was made!"});
            })
        });
    }
    // Making the request, trying to avoid callback hell
    requestNotMade(req.body.user)
        .then(() => {
            console.log("username:", req.body.user);
            // Returns the promise of a User
            return common.getUser(req.body.user);
        })
        .then(user => {
            console.log("Got user:", user);
            // Returns the promise of creating a post
            return createRequest(user, req.body.reason);
        })
        .then(result => {
            // Returns the success message
            res.json(result);
        })
        .catch(err=>{
            console.error(err);
            // Returns the rejection of the call
            if (err.canMake != undefined){
                res.json({status: 1, response: "Request has already been made!" });
            } else {
                res.json({status: 2, response: "Error in database! Try again later" });
            }
        })
        
});

module.exports = router;