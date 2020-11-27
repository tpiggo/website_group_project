function toggleForm(name) {
    var form = document.getElementById(name);
    form.classList.toggle("hidden");

    var content = document.getElementById("center");
    content.classList.toggle("hidden");

    var buttons = content.getElementsByTagName("button");
    for(var i = 0; i < buttons.length; i++){
        buttons[i].disabled = !buttons[i].disabled;
    }
}

function callBackEnd(pOpts){
    // Promisifying the callback in order to handle it asynchoronously.
    return new Promise((resolve, reject)=>{
        var aXML = new XMLHttpRequest();
        aXML.open(pOpts.type, pOpts.url);
        // On the load call for the data.
        aXML.onload = function() { 
            if (this.status >= 200 && this.status < 300) {
                resolve(aXML.response);
            } else {
                reject({
                    status: this.status,
                    statusText: aXML.statusText
                })
            }
        };
         // On an error.
        aXML.onerror = function() {
            reject({
                status: this.status,
                statusText: aXML.statusText
            })
        }
        aXML.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        aXML.send(JSON.stringify(pOpts.request));
    })
}

/**
 * @description Takes a collection and returns an array of objects
 * @param {Collection} pCol
 */
function collectionToArray(pCol){
    var aCol = [];
    for (var i = 0; i < pCol.length; i++){
        aCol.push(pCol[i]);
    }
    return aCol;
}

/**
 * @description Takes an Array of objects and returns a JSON
 * @param {Array} aObject 
 */
function makeJson(pObject){
    var aJson = {};
    for (var i = 0; i< pObject.length; i++){
        if (pObject[i].id != '' && pObject[i].type != 'submit') aJson[pObject[i].id] = pObject[i].value;
    }
    return aJson;
}

/**
 * @description Handles the errors within a json object which each element points to an element within the page
 * @param {JSON} pJson 
 */
function errorCheck(pObject){
    var areErrors = false;
    Object.keys(pObject).forEach(keys=>{
        // checking for blank entries,
        if (pObject[keys] == '') {
            areErrors = true
            document.getElementById(keys).style.border = "solid 1px red";
        }
    });
    return areErrors;
}


/**
 * @description Function triggered on good responses from the server. Since we need to update the UI without reloading
 *              the page, forcing the update by hand during the running of the Dashboard UI.
 * @param {String} type 
 * @param {JSON} aJson 
 */
function handleResponse(type, pJson){
    return 0;
}

/**
 * @description creates a dynamic collapsable element for the server response.
 * @param {*} type 
 * @param {*} msgText 
 * @todo:   Maybe this should check if a popup exists there already, if it does remove it.
 *          Or create popups which only live for 3 seconds?
 */
function createPopupMsg(pType, pMsgText, pHeaderId){
    const aDiv = document.createElement('div');
    const aButton = document.createElement('button');
    if (pType == 'error'){
        aDiv.className = "alert alert-warning alert-dismissible fade show";
    } else {
        aDiv.className = "alert alert-success alert-dismissible fade show";
    }
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
    const aHeader = document.getElementById(pHeaderId);
    aHeader.parentNode.insertBefore(aDiv, aHeader.nextSibling);
}

function handleRequest(event, element){
    // Do not allow default.
    event.preventDefault();
    // Building the request JSON
    var mForm = makeJson(element[0]);
    if (!errorCheck(mForm)){
        // clear each one!
        // Create the async promise
        var opts = {type: "POST", url: '/parse/'+element[0].id, request: mForm};
        var aPromise = callBackEnd(opts);
        // Handle
        aPromise
            .then(function(response){
                // Returning element to its JSON format
                var aId = element[0].id;
                response = JSON.parse(response);
                console.log(response);
                if (response.status == 0){
                    Object.keys(mForm).forEach(key=>{
                        document.getElementById(key).value = '';
                    });
                    createPopupMsg('success', response.response, aId+"Header");
                } else if (response.status >= 1) {
                    console.log("Error on submission");
                    // Creating Element to display in the form!
                    createPopupMsg('error', response.response, aId+"Header");
                }
            })
            .catch(function(err){console.log("error", err)});
    } else {
        console.log("there are errors");
    }
}

// Adding event listener for the text boxes.
collectionToArray(document.getElementsByTagName('input')).forEach(element=>{
    element.addEventListener('change', ()=>{
        if (element.style.border == "1px solid red") element.style.border = "";
    });
})