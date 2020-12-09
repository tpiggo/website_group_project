/**
 * @description creates a dynamic collapsable element for the server response.
 * @param {*} type 
 * @param {*} msgText 
 * @todo:   Maybe this should check if a popup exists there already, if it does remove it.
 *          Or create popups which only live for 3 seconds?
 */
function createPopupMsg(pType, pMsgText, pAfterElement) {
    const aDiv = document.createElement('div');
    const aButton = document.createElement('button');
    if (pType == 'error') {
        aDiv.className = "alert alert-warning alert-dismissible fade show";
    } else {
        aDiv.className = "alert alert-success alert-dismissible fade show";
    }
    aDiv.setAttribute('type', 'popup-msg')
    aDiv.setAttribute('role', 'alert');
    aButton.className = "close";
    aButton.style.margin = 0;
    aButton.setAttribute('data-dismiss', 'alert');
    aButton.setAttribute('aria-label', 'Close');
    aButton.setAttribute('type', 'button');
    aButton.innerHTML = "<span aria-hidden='true'>&times;</span>";
    const aTextNode = document.createTextNode(pMsgText);
    aDiv.appendChild(aTextNode);
    aDiv.appendChild(aButton);
    const afterElement = document.getElementById(pAfterElement);
    // Remove an old popup
    if (afterElement.nextElementSibling.getAttribute('type') == 'popup-msg') {
        afterElement.parentNode.removeChild(afterElement.nextSibling);
    }
    afterElement.parentNode.insertBefore(aDiv, afterElement.nextSibling);
    fade(aDiv);
}

/**
 * 
 * @param {HTMLElement} div 
 */
function fade(div) {
    setTimeout(function () {
        div.remove();
    }, 4000);
}
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
            aXML.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            aXML.send(JSON.stringify(pOpts.request));
        } else if (pOpts.contentType == 'FormData'){
            aXML.send(pOpts.request);
        } else {
            aXML.send();
        }
    })
}
/**
 * @description Takes a collection and returns an array of objects
 * @param {Collection} pCol
 */
function collectionToArray(pCol) {
    var aCol = [];
    for (var i = 0; i < pCol.length; i++) {
        aCol.push(pCol[i]);
    }
    return aCol;
}