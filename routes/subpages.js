const express = require('express');
const router = express.Router();
const data = require('../data.json');

router.get('/:pagename', (req, res) => {
    // console.log('Request received for /' + req.params.pagename + ' - sending file /views/' + req.params.pagename);
    
    //Here we take data from the JSON file and send it to subpage.ejs
    const entryOuter = req.baseUrl.replace("/", '');
    console.log(data[entryOuter]);
    const prospData = data[entryOuter][req.params.pagename];
    const title = data.prospective.title;
    
    res.render('subpage', {title, ...prospData});
    // console.log({title, ...prospData});
});

module.exports = router;