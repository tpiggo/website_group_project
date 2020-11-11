// Packages
const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const app = express();

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

app.get('/:pagename', (req, res) => {
    // console.log('Request received for /' + req.params.pagename + ' - sending file /views/' + req.params.pagename);
    res.render(req.params.pagename);
});

//If the route isn't recognized
app.get('*', (req, res) => {
    console.log(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
    res.send(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
});

const PORT = process.env.POsRT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));