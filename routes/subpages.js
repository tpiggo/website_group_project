const express = require('express');
const router = express.Router();
const app = express();
const session = require('express-session');
const { canEdit } = require('../middleware/index.js');
const common = require('../common.js');
const markdown = require('markdown-it')('commonmark');
const Page = require('../models/Page');
const Subpage = require('../models/Subpage');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


router.get('/:pagename', (req, res) => {
    
    
    console.log(req.originalUrl.substr(1));
    Subpage.findOne({ path: req.originalUrl.substr(1) }, (err, subpage) => {
        if (err) {
            console.log(err);
        } else if (subpage == null) {
            res.redirect('/unknown');
        }
        else {
            if(subpage.markdown) {
                subpage.html = markdown.render(subpage.markdown);
            }
            const logged = req.session.authenticated;
            const username = req.session.username;

            common.getNavBar().then(pages => {

                res.render('subpage.ejs', { 
                    title: subpage.name, 
                    content:subpage, logged, 
                    username, 
                    theme: req.session.theme, 
                    navbar: pages.navbar});

            }).catch(err => {
                console.log(err);
                res.send("Error getting navbar from DB");
            });
        }
    });
});


router.get('/:pagename/edit', canEdit, (req, res) => {

    //Get navbar for rendering pages
    var navbar;
    common.getNavBar().then(pages => {
        navbar = pages.navbar;
    }).catch(err => {
        console.log(err);
        res.send("Error getting navbar from DB");
    });

    console.log("Loading page " + req.params.pagename + " for editing.");
    const entry = req.baseUrl.substr(1);
    var pagename = req.params.pagename;
    var path = entry + "/" + pagename;

    var page = Subpage.findOne({ path }, (err, pagedata) => {
        if (err) {
            console.log(err);
        } else if (pagedata) {
            common.getNavBar().then(pages => {
                var navbar = pages.navbar;
                var title = pagedata.name;
                var logged = req.session.authenticated;
                var username = req.session.username;
                var content = pagedata.markdown;
                var preview = markdown.render(content);
                res.render('editor.ejs', {
                    title,
                    content,
                    logged,
                    username,
                    preview,
                    theme: req.session.theme,
                    navbar
                });
            }).catch(err => {
                console.log(err);
                res.send("Error getting navbar from DB");
            });
        } else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage " + pagename);
            res.redirect('/unknown');
        }

    });

});

//TODO fix the duplicate code
router.get('/:pagename/:subpage', (req, res) => {
    console.log("request received from submenu link!");
    
    Subpage.findOne({ path: req.originalUrl.substr(1) }, (err, subpage) => {
        if (err) {
            console.log(err);
        } else if (subpage == null) {
            res.redirect('/unknown');
        }
        else {
            if(subpage.markdown) {
                subpage.html = markdown.render(subpage.markdown);
            }
            const logged = req.session.authenticated;
            const username = req.session.username;

            common.getNavBar().then(pages => {

                res.render('subpage.ejs', { 
                    title: subpage.name, 
                    content:subpage, logged, 
                    username, 
                    theme: req.session.theme, 
                    navbar: pages.navbar});

            }).catch(err => {
                console.log(err);
                res.send("Error getting navbar from DB");
            });
        }
    });

});

router.post('/:pagename/edit', canEdit, (req, res) => {

    var navbar;

    var pagename = req.params.pagename;
    const entry = req.baseUrl.replace("/", '');
    var path = entry + "/" + pagename;
    var page = Subpage.findOne({ path }, (err, pagedata) => {
        if (err) {
            console.log(err);
        } else if (pagedata) {
            pagedata.markdown = req.body.markdown;
            pagedata.save((err) => {
                if (err) {
                    console.log(err);
                }
            });
            common.getNavBar().then(pages => {
                navbar = pages.navbar;
                var title = pagedata.name;
                var logged = req.session.authenticated;
                var username = req.session.username;
                var content = pagedata.markdown;
                var preview = markdown.render(content);
                res.render('editor.ejs', {
                    title,
                    content,
                    logged,
                    username,
                    preview,
                    theme: req.session.theme,
                    navbar
                });
            }).catch(err => {
                console.log(err);
                res.send("Error getting navbar from DB");
            });
        } else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage " + pagename);
            res.redirect('/unknown');
        }

    });
});
module.exports = router;