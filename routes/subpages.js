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

//Route for normal subpages
router.get('/:pagename', (req, res) => {
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

//Route for opening the editor for each subpage
router.get('/:pagename/:subpage?/edit', canEdit, (req, res) => {
    console.log("Loading page " + req.params.pagename + " for editing.");
    const entry = req.baseUrl.substr(1);
    var pagename = req.params.pagename;
    var path = entry + "/" + pagename;
    if(req.params.subpage){
        path += "/" + req.params.subpage;
    }
    var page = Subpage.findOne({ path }, (err, pagedata) => {
        if (err) {
            console.log(err);
        } else if (pagedata) {
            common.getNavBar().then(pages => { //Load the navbar for the page
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

//Route for loading sub-subpages
router.get('/:pagename/:subpage', (req, res) => {
    Subpage.findOne({ path: req.originalUrl.substr(1) }, (err, subpage) => {
        if (err) {
            console.log(err);
        } else if (subpage == null) {
            res.redirect('/unknown');
        }
        else {
            if(subpage.markdown) { //If there's markdown, render it as the HTML. Otherwise there is a fallback to use normal HTML contents
                subpage.html = markdown.render(subpage.markdown);
            }
            const logged = req.session.authenticated;
            const username = req.session.username;
            common.getNavBar().then(pages => { //Get the navbar for the page
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
//Route for saving edits to subpages
router.post('/:pagename/:subpage?/edit', canEdit, (req, res) => {
    var pagename = req.params.pagename;
    const entry = req.baseUrl.replace("/", '');
    var path = entry + "/" + pagename;
    if(req.params.subpage){
        path += "/" + req.params.subpage;
    }
    var page = Subpage.findOne({ path }, (err, pagedata) => { //Locate the subpage in the DB based on its path
        if (err) {
            console.log(err);
        } else if (pagedata) {
            pagedata.markdown = req.body.markdown;
            pagedata.save((err) => {
                if (err) {
                    console.log(err);
                }
            });
            common.getNavBar().then(pages => { //Get the navbar for the page
                navbar = pages.navbar;
                var title = pagedata.name;
                var logged = req.session.authenticated;
                var username = req.session.username;
                var content = pagedata.markdown;
                var preview = markdown.render(content);
                res.render('editor.ejs', { //Reload the page once the changes are saved
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