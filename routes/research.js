const express = require('express');
const router = express.Router();
const common = require("../common.js");
const TechnicalReport = require('../models/TechnicalReport.js');

//Route for obtaining the list of technical reports
router.get('/technical-reports', (req, res) => {
    TechnicalReport
        .find()
        .sort({reportDate: "descending"})
        .exec((err,result) => {
            if (err) {
                console.error(err);
            }
            else {
                result = addInformation(result);
                content = {html: "./list/technicalreports", data: result};
                common.getNavBar().then(pages => {
                    navbar = pages.navbar;
                    res.render('subpage', {
                        title: "Technical Reports",
                        content,
                        logged: req.session.authenticated,
                        username: req.session.username,
                        theme: req.session.them,
                        navbar
                    });
                }).catch(err => {
                    console.log(err);
                    res.send("Error getting navbar from DB");
                });
            }
        });
});

/**
 * Adds information to an array of tech reports
 * @param {array} techReports 
 */
function addInformation(techReports){
    var i = 1;
    for (let rep of techReports){
        rep.num = i;
        rep.boxId = `report-${i}`
        rep.repDate = rep.reportDate.toDateString();
        i++;
    }
    return techReports;
}

module.exports = router;