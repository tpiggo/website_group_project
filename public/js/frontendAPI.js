/**
 * 
 * @todo: Add all the common functions here and figure out how to export them without breaking the code.
 */




/**
 * @description Calls the proper route desired and returns a promise
 * @param {JSON} pOpts 
 * @returns {Promise}
 */

function callBackEnd(pOpts) {
    // Promisifying the callback in order to handle it asynchoronously.
    return new Promise((resolve, reject) => {
        var aXML = new XMLHttpRequest();
        aXML.open(pOpts.type, pOpts.url);
        // On the load call for the data.
        aXML.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(aXML.response));
            } else {
                reject(JSON.parse({
                    status: this.status,
                    statusText: aXML.statusText
                }))
            }
        };
        // On an error.
        aXML.onerror = function () {
            reject(JSON.parse({
                status: this.status,
                statusText: aXML.statusText
            }))
        }
        // different content types means sending different things
        if (pOpts.contentType == 'JSON'){
            aXML.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
            aXML.send(JSON.stringify(pOpts.request));
        } else if (pOpts.contentType == 'FormData'){
            aXML.send(pOpts.request);
        } else {
            aXML.send();
        }
        
    })
}