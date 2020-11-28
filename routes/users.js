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
    const content = {"html": 'login.ejs', "script":""};
    const menu = [];
    return res.render('user-layout', {title, menu, content, logged: req.session.authenticated, user: req.session.username});
    
    
});
router.get('/register', (req, res)=>{
    if (!req.session.authenticated){
        const title = "Register";
        const content = {"html": 'register.ejs', "script": "<script src='/js/register.js'></script>"};
        return res.render('user-layout', {title, content, logged: req.session.authenticated, user: req.session.username});
    } else {
        return res.redirect('/');
    }
});

router.post('/login', canUseRoute, (req, res)=> {
    var username = req.body.username;
    var password = req.body.password;
    var errors = [];
    const title = "Login";
    const content = {"html": 'login.ejs', "script":""};
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
            "html": 'register.ejs', 
            "script": "<script src='/js/register.js'></script>"
        };
    // var errors = [];

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
            // Should get a success message that user was created
            return res.redirect('/users/register');
        })
        .catch(errors => {
            console.log("Error occurred!")
            return res.render('user-layout', {
                title, 
                content,
                logged: req.session.authenticated,
                user: req.session.user,
                errors
            });
        })
    

    // // User query from database
    // User.find({$or: [{name: username},{email: email}]}, (err, result)=>{
    //     if (err) console.log(err);
    //     else console.log(result)
    // }).then(user=>{
    //     //console.log(user);
    //     if (user.length > 0){
    //         user.forEach(item=>{
    //             if (item.email == email){
    //                 errors.push({msg: "Email already registered!"});
    //             }
    //             if (item.username == username){
    //                 errors.push({msg: "Username already registered!"});
    //             }
    //             console.log(item, email, username);
    //         });
    //         return res.render('user-layout', {
    //             title, 
    //             content,
    //             logged: req.session.authenticated,
    //             user: req.session.user,
    //             errors
    //         });
    //     } else{
    //         // The data has passed the data verification system. Enter it into the database
    //         var user = new User({
    //             username: username,
    //             email: req.body.email,
    //             password: password,
    //             userType: 0
    //         });
    //         user.save((err) => {
    //             if(err) {console.log(err);}
    //         });
    //         console.log("User was added to the database!!")
    //     }
    //     return res.redirect('/users/register');
    // }).catch(err=>console.log(err));
});


// Adding the settings route
router.get('/settings', isAuthenticated,  (req, res)=>{
    User.findOne({username: req.session.username})
        .then(user=>{
            if (user){
                // Evidently if the user is logged in, this path should be the only one to be executed
                const {username, email} = user;
                const title = "Settings";
                content = {"html": "settings",  "script": "<script src='/js/settings.js'></script>"}
                // Render a subpage with the error
                res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username, email: email})
            } else {
                // This shouldn't occur if the user is logged in, but protecting against errors
                const title = "Error!";
                content = {"html": "user-error"}
                // Render a subpage with the error
                res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username})
            }
        })
        .catch(err=>{
            console.log(err);
            const title = "Error!";
            content = {"html": "user-error"}
            // Render a subpage with the error
            res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username})
        });
});


router.post('/settings', isAuthenticated, (req, res)=>{
    
    console.log("Received update for a user!");
    // This shouldn't occur if the user is logged in, but protecting against errors
    console.log(req.body);
    const mUser = req.session.username;
    const {username, password, confPassword, curPassword, email } = req.body;
    /**
     * @description Finds a user within the database
     * @param {String} username
     * @returns {Promise} 
     */
    function findUser(username){
        var errors = [];
        return new Promise((resolve, reject) => {
            User.findOne({username: username}, (err, user) =>{
                if (err){
                    console.error(err);
                    errors.push({msg: "Error during connection!"});
                    reject(errors);
                } else {
                    resolve(user);
                }
            })
        });
    }

    /**
     * @description updates a given users information
     * @param {User} user 
     * @returns {Promise}
     */
    function updateUser(user){
        return new Promise((resolve, reject) => {
            var errors = [];
            if (bcrypt.compareSync(curPassword, user.password)){
                if (username != user.username && username != '') {
                    user.username = username;
                    req.session.username = username;
                }
                if ( user.email != email && email != '') user.email = email
                if (password != '' && confPassword != '') {
                    // update the passwords
                    const mPass = bcrypt.hashSync(req.body.password,10);
                    user.password = mPass;
                }
                // Saving the username into the session, potentially not the greatest solution, but works for now
                req.session.authenticated = true;
                user.save((err) =>{
                    if (err) { 
                        console.error(err);
                        errors.push({msg: 'Error during connection! Try again!'});
                        reject({errors, user});
                    }
                });
                resolve({success: {msg: "Successfully updated!"}, user});
            } else {
                errors.push({msg: 'Wrong password! Try again!'});
                reject({errors, user});
            }
        });
    }

    // Find and update user
    findUser(username)
        .then(user => {
            return updateUser(user)
        })
        .then(result => {
            // Success messages in success.msg
            const title = "Settings";
            content = {"html": "settings",  "script": "<script src='/js/settings.js'></script>"}
            // Render a settings page with the error
            const user = result.user;
            return res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username, email: user.email});
        })
        .catch(result => {
            const title = "Settings";
            content = {"html": "settings",  "script": "<script src='/js/settings.js'></script>"}
            // Render a settings page with the error
            const user = result.user;
            const errors = result.errors;
            return res.render('user-layout', {title, content, menu: [], logged: req.session.authenticated, user: req.session.username, email: user.email, errors});
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