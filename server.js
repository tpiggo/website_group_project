// Packages
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render(__dirname + "/views/homepage.ejs");
});

app.get('/:pagename', (req, res) => {
    // console.log('Request received for /' + req.params.pagename + ' - sending file /views/' + req.params.pagename);
    res.render(__dirname + '/views/' + req.params.pagename + '.ejs');
});

//If the route isn't recognized
app.get('*', (req, res) => {
    console.log(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
    res.send(`404 REQUEST NOT RECOGNIZED [${req.url}]`);
});

const PORT = process.env.POsRT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));