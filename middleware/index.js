const User = require('../models/User.js');
const common = require('../common');
var middleware = {};

middleware.isAuthenticated = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    } else {
        const title = "Error!";
        var content = { "html": "<h1>You do not have access to this page! Please <a href='/users/login'>Login</a> to view this content</h1>" }
        // Render a subpage with the error
        common.getNavBar().then(pages => {
            res.render('subpage', {
                title, 
                content, 
                menu: [],
                logged: req.session.authenticated,
                username: req.session.username,
                theme: req.session.theme,
                navbar: pages.navbar
            });
        }).catch(err => {
            console.log(err);
            res.send("Error getting navbar from DB");
        });
    }
}


/**
 * @description gets a Users clearance type and allows or accepts or rejects 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next
 * @returns {Function}
 */
middleware.isAuthDashboard = (minLevel = 1) =>{
    return (req, res, next) => {
        if (req.session.authenticated) {
            common.getUser(req.session.username)
                .then(user => {
                    if (!user){
                        console.log("User not found!!");
                        res.send({status: 1, response: "Error: Cannot find user! Try again later."});
                    }
                    else {
                        if ( user.userType >= minLevel){
                            return next();
                        }
                        // Reject this user, improper clearance.
                        res.send({status: 1, response: "Error: Cannot perform this task!"});
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.send({status: 2, response: "Error: Cannot access database! Try again later."});
                });
        } else {
            console.log("rejected!");
            // Reject the request outright
            res.json({status: 2, response: "Request Rejected"});
        }
    }
}

middleware.canUseRoute = (req, res, next) =>{
    if (!req.session.authenticated){
        return next();
    } 
    return res.redirect('/denied');
}

function isAuthorized(req, res, next, level) {
    if(req.session.authenticated){
        User.findOne({username: req.session.username}, (err,user) => {
            if(err){
                console.log(err);
            }
            if(user){
                if(user.userType >= level){
                    return next();
                }else {
                    return res.redirect('/denied');
                }
            }
        });
    }else{
        return res.redirect('/denied');
    }
}

middleware.canEdit = (req, res, next) => {
    return isAuthorized(req,res,next,1);
}

middleware.canCreateOrDestroy = (req, res, next) => {
    return isAuthorized(req,res,next,2);
}
module.exports = middleware;