const express = require('express');
const router = express.Router();
const app = express();
const session = require('express-session');
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
                res.send("404 : this page doesn't exist");
            }
            else {
                var content = data.subpages.find(e => e.path == req.params.pagename);
                if (content == undefined) {
                    res.send("404 : this subpage doesn't exist");
                }
                else {
                    var menu = []
                    data.subpages.forEach(element => {
                        menu.push([element.path, element.name]);
                    });
                    var title = data.title;
                    const logged = req.session.authenticated;
                    const user = req.session.username;
                    const rendered_html = content.markdown ? markdown.render(content.markdown) : content.html;
                    res.render('subpage.ejs', { title, menu, content, rendered_html, logged, user });
                }

            }
        }
        );
});
router.get('/:pagename/edit', (req, res) => {
    console.log("Loading page " + req.params.pagename + " for editing.");
    var pagename = req.params.pagename;
    var page = Subpage.findOne({path: pagename}, (err,pagedata) => {
        if(err){
            console.log(err);
        }else if(pagedata){
            var title=pagedata.name;
            var logged=req.session.authenticated;
            var user=req.session.username;
            var content=pagedata.markdown;
            if(logged){ //TODO: Integrate proper permissions here
                res.render('editor.ejs',{
                    title,
                    content,
                    logged,
                    user
                });
             }
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
        }

    });
    
});

router.post('/:pagename/edit',(req, res) => {
    var pagename = req.params.pagename;
    var page = Subpage.findOne({path: pagename}, (err,pagedata) => {
        if(err){
            console.log(err);
        }else if(pagedata){
            pagedata.markdown = req.body.markdown;   
            pagedata.save((err) => {
                console.log(err);
            });
            var title=pagedata.name;
            var logged=req.session.authenticated;
            var user=req.session.username;
            var content=pagedata.markdown;
            res.render('editor.ejs',{
                title,
                content,
                logged,
                user
            });
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
        }

    });
});
module.exports = router;