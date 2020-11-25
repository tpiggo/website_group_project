const { response } = require('express');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

// Body parser for these routes. Needed since sending JSONs to and from the frontend.
router.use(bodyParser.json());
/**
 * Dashboard forms 
 */

// Add TA form
router.post('/addTA', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const response = {request: 'AddTa request'};
        res.json(response);
        console.log("Sent response");
    }
});

router.post('/addAward', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const response = {request: 'AddAward request'};
        res.json(response);
        console.log("Sent response");
    }
});

router.post('/addNews', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const response = {request: 'addNews request'};
        res.json(response);
        console.log("Sent response");
    }
});

router.post('/addEvent', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const response = {request: 'AddEvent request'};
        res.json(response);
        console.log("Sent response");
    }
});

router.post('/addTech', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const response = {request: 'AddTech request'};
        res.json(response);
        console.log("Sent response");
    }
});

router.post('/addPosting', (req, res)=>{
    // Auth the session
    if (req.session.authenticated){
        console.log(req.body);
        const response = {request: 'AddPosting'};
        res.json(response);
        console.log("Sent response");
    }
});



module.exports = router;


