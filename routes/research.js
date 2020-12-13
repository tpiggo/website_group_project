const express = require('express');
const router = express.Router();
const common = require("../common.js");
const TechnicalReport = require('../models/TechnicalReport.js');

//Route for obtaining the list of technical reports
router.get('/technical-reports', (req, res) => {
    // Find all the technical reports and render them
    TechnicalReport
        .find()
        .sort({reportDate: "descending"})
        .exec((err,result) => {
            if (err) {
                // Throw error
                console.error(err);
                res.send("Error: Please return to main");
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
                        theme: req.session.theme,
                        navbar
                    });
                }).catch(err => {
                    // Cause an error on nav bar
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