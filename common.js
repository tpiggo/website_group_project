var common = {};

/**
* Get all the data from the collection specified by Model
* @param {Model} Model indicate the collection to get data from
* @returns {Promise}
*/

common.getAllDataFrom = (Model) => {
    return new Promise((resolve, reject) => {
        Model.find({}, (err, content) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
 }

 /**
* Get all the data from the collection specified by Model that has a specific attribute
* @param {Model} Model indicate the collection to get data from
* @param {JSON} attribute indicates the attribute the documents need to have
* @returns {Promise}
*/

common.getAllDataWith = (Model, attribute) =>{
    return new Promise((resolve, reject) => {
        Model.find(attribute, (err, content) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
 }


 module.exports = common;
