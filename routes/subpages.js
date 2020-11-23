const express = require('express');
const router = express.Router();
const session = require('express-session');
const Page = require('../models/Page.js');
const Subpage = require('../models/Subpage.js');
/**
 * TODO: Add Session store to avoid memory leaks
 */

router.get('/:pagename', (req, res) => {
    console.log('Request received for /' + req.params.pagename + ' - sending file /views/' + req.params.pagename);

    const entry = req.baseUrl.replace("/", '');
    Page
        .findOne({ path: entry })
        .populate('subpages')
        .exec((err, data) => {
           if (err) {
                console.error(err);
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
                    res.render('subpage.ejs', { title, menu, content, logged, user });
                }

            }
        }
        );
});


module.exports = router;