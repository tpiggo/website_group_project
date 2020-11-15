// Packages
const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const app = express();

//Normally you get data from the database, but
//for now we use a local JSON file
const data = require('./data.json');

// DB config
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('MongoDB Connected!')})
    .catch(err => { console.log(err) });

// Body Parser
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

// EJS startup
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('homepage');
});

//Request for the Prospective page
app.get('/prospective/:pagename', (req, res) => {
    // console.log('Request received for /' + req.params.pagename + ' - sending file /views/' + req.params.pagename);
    
    //Here we take data from the JSON file and send it to subpage.ejs
    const prospData = data.prospective[req.params.pagename];
    const title = data.prospective.title;
    
    res.render('subpage', {title, ...prospData});
    // console.log({title, ...prospData});
});

//If the route isn't recognized
app.get('*', (req, res) => {
    console.log(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
    res.send(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
});

const PORT = process.env.POsRT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));