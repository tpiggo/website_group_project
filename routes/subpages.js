const express = require('express');
const router = express.Router();
const app = express();
const session = require('express-session');
const { canEdit} = require('../middleware/index.js');
const markdown = require('markdown-it')('commonmark');
const Page = require('../models/Page.js');
const Subpage = require('../models/Subpage.js');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

router.get('/:pagename', (req, res) => {
    console.log('Request received for /' + req.params.pagename + ' - sending file /views/' + req.params.pagename);

    const entry = req.baseUrl.replace("/", '');
    Page
        .findOne({ path: entry })
        .populate('subpages')
        .exec((err, data) => {
           if (err) {
                console.logor(err);
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
                        menu.push([element.path, element.name]);
                    });
                    var title = data.title;
                    const logged = req.session.authenticated;

                    const username = req.session.username;
                    const rendered_html = content.markdown ? markdown.render(content.markdown) : content.html;
                    res.render('subpage.ejs', { title, menu, content, rendered_html, logged, username });

                }

            }
        }
        );
});
router.get('/:pagename/edit', canEdit, (req, res) => {
    console.log("Loading page " + req.params.pagename + " for editing.");
    var pagename = req.params.pagename;
    const entry = req.baseUrl.replace("/", '');
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
                    preview
            });
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
            res.redirect('/unknown');
        }

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
                preview
            });
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
            res.redirect('/unknown');
        }

    });
});
module.exports = router;