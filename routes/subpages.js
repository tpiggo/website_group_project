const express = require('express');
const router = express.Router();
const app = express();
const session = require('express-session');
const { canEdit} = require('../middleware/index.js');
const common = require('../common.js');
const markdown = require('markdown-it')('commonmark');
const Page = require('../models/Page');
const Subpage = require('../models/Subpage');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


router.get('/:pagename', (req, res) => {
    console.log('Request received for /' + req.params.pagename + ' - sending file /views/' + req.params.pagename);

    const entry = req.baseUrl.replace("/", '');
    console.log(entry);
    Page
        .findOne({ path: entry })
        .populate('subpages')
        .exec((err, data) => {
            if (err) {
                console.log(err);
            }
            else if (data == null) {
                res.redirect('/unknown');
            }
            else {
                var content = data.subpages.find(e => e.path == (entry + "/" + req.params.pagename));
                if (content == undefined) {
                    res.redirect('/unknown');
                }
                else {
                    var menu = []
                    data.subpages.forEach(element => {
                        // if(element.submenu)console.log(element.submenu[0]);
                        menu.push({ path: element.path, name: element.name, submenu: element.submenu });
                    });
                    var title = data.title;
                    const logged = req.session.authenticated;

                    const username = req.session.username;
                    content.html = content.markdown ? markdown.render(content.markdown) : content.html;

                    res.render('subpage.ejs', { title, menu, content, logged, username, theme: req.session.theme});

                }

            }
        });
});
router.get('/:pagename/edit', canEdit, (req, res) => {
    console.log("Loading page " + req.params.pagename + " for editing.");
    const entry = req.baseUrl.substr(1);
    var pagename = req.params.pagename;
    var path = entry+"/"+pagename;
    var page = Subpage.findOne({path}, (err,pagedata) => {
        if(err){
            console.log(err);
        }else if(pagedata){
            var title=pagedata.name;
            var logged=req.session.authenticated;
            var username=req.session.username;
            var content=pagedata.markdown;
            var preview=markdown.render(content);
            res.render('editor.ejs',{
                    title,
                    content,
                    logged,
                    username,
                    preview,
                    theme: req.session.theme
            });
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
            res.redirect('/unknown');
        }

    });

});
//TODO fix the duplicate code
router.get('/:pagename/:subpage', (req, res) => {
    console.log("request received from submenu link!");

    const entry = req.baseUrl.replace("/", '');

    function findSubpage(path) {
        console.log('find subpage of : ' + path);
        return new Promise((resolve, reject) => {
            Subpage.findOne({ path: path }, (err, subpage) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(subpage);
                }
            })
        });
    }
    var page;
    common.getDataOfSubpage(entry, req.params.pagename).then(data => {
        var title = data.title;

        const logged = req.session.authenticated;
        const username = req.session.username;

        page = { title, menu:data.menu, content: data.content, logged, username, theme: req.session.theme};

        return findSubpage(req.originalUrl.substr(1));
    }).then(subpage => {
        page['content'].html = subpage['content'].markdown ? markdown.render(subpage['content'].markdown) : subpage['content'].html;
        console.log(page);
        res.render('subpage.ejs', page);
    }).catch(err => {
        res.send(err);
    });

});

router.post('/:pagename/edit', canEdit, (req, res) => {
    var pagename = req.params.pagename;
    const entry = req.baseUrl.replace("/", '');
    var path = entry+"/"+pagename;
    var page = Subpage.findOne({path}, (err,pagedata) => {
        if(err){
            console.log(err);
        }else if(pagedata){
            pagedata.markdown = req.body.markdown;   
            pagedata.save((err) => {
                if(err){
                    console.log(err);
                }
            });
            var title=pagedata.name;
            var logged=req.session.authenticated;
            var username=req.session.username;
            var content=pagedata.markdown;
            var preview=markdown.render(content);
            res.render('editor.ejs',{
                title,
                content,
                logged,
                username,
                preview,
                theme: req.session.theme
            });
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
            res.redirect('/unknown');
        }

    });
});
module.exports = router;