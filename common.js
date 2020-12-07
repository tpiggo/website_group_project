const {connection} = require('mongoose');
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
common.getAllDataWith = (Model, attribute) => {
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

/**
 * @description Gets all the data using getAllData, and returns teh data with the Collection name, otherwise error
 * @param {Model} Model indicate the collection to get data from
 * @param {JSON} attribute indicates the attribute the documents need to have
 *  @returns {Promise}
 */
common.getAllDataWithModel = (Model, query)=>{
    return new Promise((resolve, reject) => {
        common.getAllDataWith(Model, query)
            .then(result => {
                resolve({modelName: Model.collection.collectionName, data: result})
            })
            .catch(err=>reject(err));
    });
}


/** Get and populate all the subpages of a page and extract the content of a specified subpage
 * @param {String} page indicate the collection to get data from
 * @param {String} subpage indicates the document to extract the content from
 * @returns {Promise} returns a formatted menu of the page to be rendered and the content of the specified subpage
*/
const Page = require('./models/Page.js');
common.getDataOfSubpage = (page, subpage) => {
    return new Promise((resolve, reject) => {
        Page
            .findOne({ path: page })
            .populate('subpages')
            .exec((err, data) => {
                if (err) {
                    console.logo(err);
                    reject("Internal error");
                }
                else if (data == null) {
                    reject("404 : this page doesn't exist");
                }
                else {
                    var content = data.subpages.find(e => e.path.includes(subpage));
                    if (content == undefined) {
                        reject("404 : this subpage doesn't exist");
                    }
                    else {
                        var menu = []
                        data.subpages.forEach(element => {
                            menu.push({ path: element.path, name: element.name, submenu: element.submenu });
                        });
                        resolve({ menu: menu, content: content });
                    }

                }
            }
            );

    });
}

/** Get and populate all the subpages of a page and extract the content of a specified subpage
 * @param {String} page indicate the collection to get data from
 * @param {String} subpage indicates the document to extract the content from
 * @returns {Promise}   returns a formatted menu of the page to be rendered and the content of the specified subpage
*/
common.getPagesMenu = (page) => {
    return new Promise((resolve, reject) => {
        Page
            .findOne({ path: page })
            .populate('subpages')
            .exec((err, data) => {
                if (err) {
                    console.logo(err);
                    reject("Internal error");
                }
                else if (data == null) {
                    reject("404 : this page doesn't exist");
                }
                else {
                    var menu = []
                    data.subpages.forEach(element => {
                        menu.push({ path: element.path, name: element.name, submenu: element.submenu });
                    });
                    resolve({ menu: menu});
                    }

            });

    });
}


common.getModelNames = (modelName) =>{
    return new Promise((resolve, reject) =>{
        connection.db.listCollections().toArray(function(err, names){
            if (err)
                reject(err);
            resolve(names);
        });
    });
}

common.searchModelNames = (search) => {
    return new Promise((resolve, reject)=>{
        common.getModelNames()
            .then(results => {
                var matchSearch = [];
                results.forEach(value=> {
                    if (value.name == search){
                        matchSearch.push(value);
                    }
                });
                resolve(matchSearch);
            })
            .catch(err=>reject(err));
    });
}

module.exports = common;
