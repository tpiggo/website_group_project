// Packages
const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
// DB config
const db = require('./config/keys').MongoURI;

// Connect to Mongo
// Setting the proper instances for the mongoose engine 
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(db)
    .then(() => { console.log('MongoDB Connected!')})
    .catch(err => { console.log(err) });

//Session Config
app.use(session({
    secret: require('./config/keys').session_secret,
    resave: true,
    saveUninitialized: true,
    cookie: { 
        maxAge: 3600000,
        secure: false
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));
// Body Parser
app.use(express.urlencoded({ extended: false }));


app.use(express.static('public'));

// EJS startup
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use('/', require("./routes/index"));
app.use('/users', require("./routes/users"));
app.use('/:page', require('./routes/subpages'));


//If the route isn't recognized
app.get('*', (req, res) => {
    console.log(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
    res.send(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
