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
    console.log(entry);
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
                var content = data.subpages.find(e => e.path.includes(req.params.pagename));
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

                    const username = req.session.username;
                    content.html = content.markdown ? markdown.render(content.markdown) : content.html;
                    
                    res.render('subpage.ejs', { title, menu, content, logged, username });

                }

            }
        }
        );
});

router.get('/:pagename/edit', (req, res) => {
    console.log("Loading page " + req.params.pagename + " for editing.");
    var pagename = req.params.pagename;
    Subpage.findOne({path: pagename}, (err,pagedata) => {
        if(err){
            console.log(err);
        }else if(pagedata){
            var title=pagedata.name;
            var logged=req.session.authenticated;
            var username=req.session.username;
            var content=pagedata.markdown;
            if(logged){ //TODO: Integrate proper permissions here
                res.render('editor.ejs',{
                    title,
                    content,
                    logged,
                    username
                });
             }
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
        }

    });
    
});

router.post('/:pagename/edit',(req, res) => {
    var pagename = req.params.pagename;
    Subpage.findOne({path: pagename}, (err,pagedata) => {
        if(err){
            console.log(err);
        }else if(pagedata){
            pagedata.markdown = req.body.markdown;   
            pagedata.save((err2) => {
                console.log(err2);
            });
            var title=pagedata.name;
            var logged=req.session.authenticated;
            var user=req.session.username;
            var content=pagedata.markdown;
            res.render('editor.ejs',{
                title,
                content,
                logged,
                username
            });
        }else {
            console.log("User " + req.session.username + "tried to edit non-existent subpage "+ pagename);
        }

    });
});
module.exports = router;