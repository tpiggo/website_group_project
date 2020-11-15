const express = require('express');
const router = express.Router();

router.get('/:pagename', (req, res) => {
    console.log('Request received for ' + req.baseUrl);
    res.render(req.params.pagename);
});

module.exports = router;