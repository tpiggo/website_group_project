const User = require('../models/User.js');
const common = require('../common');
var middleware = {};

middleware.isAuthenticated = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    }
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