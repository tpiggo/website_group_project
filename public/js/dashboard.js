//Display forms
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

//Add a new input field
var pointer = 0;
var total = 0;
function addField() {
    console.log(pointer);
    var previousField = document.getElementById('divInstr' + pointer);
    pointer++;
    total++;
    var newField = previousField.cloneNode(true);
    newField.id = 'divInstr' + pointer;
    newField.getElementsByTagName('input')[0].id = 'instructor' + pointer;
    newField.getElementsByTagName('input')[0].name = 'instructor' + pointer;
    newField.getElementsByTagName('input')[0].value = '';

    if(pointer==1) {
        var minus = document.createElement('img');
        minus.src = '../images/minus.png'
        newField.getElementsByTagName('br')[0].parentNode.insertBefore(minus, newField.getElementsByTagName('input')[0].nextSibling);
   
    } else var minus = newField.getElementsByTagName('img')[0];
    
    minus.id = 'minus' + pointer;
    minus.alt = 'minus' + pointer;
    minus.setAttribute('onclick', 'removeField(' + pointer + ')');

    previousField.parentNode.insertBefore(newField, previousField.nextSibling);

}

function removeField(index) {
    var field = document.getElementById('divInstr' + index);
    var minus = document.getElementById('minus' + index);
    field.remove();
    minus.remove();
    if (index == pointer) pointer--;
    total--;
    if(total == 0) pointer =0;
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
 * @param {Array} pObject 
 */
function makeJson(pObject){
    var aJson = {};
    var terms = [];
    var instructors = []
    for (var i = 0; i< pObject.length; i++){
        if (pObject[i].id != '' && pObject[i].type != 'submit') {
            var currId = pObject[i].id;
            
            if(currId.includes('instruct')) {
                instructors.push(pObject[i].value);
            } else if (currId == "w2021c" || currId == "s2021c" || currId == "f2021c") {
                if(document.getElementById(currId).checked) terms.push(pObject[i].value);
            }
            else aJson[pObject[i].id] = pObject[i].value;
        }
    }
    if(instructors.length >0) aJson['instructors'] = instructors;
    if(terms.length > 0) aJson['termsOffered'] = terms;
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
        if (pObject[keys] == '' && document.getElementById(keys) != null) {
            areErrors = true;
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
    console.log(mForm);
    console.log(element[0]);
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
                    document.getElementById(element[0].id).reset();
                    // Object.keys(mForm).forEach(key=>{
                    //     document.getElementById(key).value = '';
                    // });
                    createPopupMsg('success', response.response, aId+"Header");
                } else if (response.status >= 1) {
                    console.log("Error on submission");
                    // Creating Element to display in the form!
                    createPopupMsg('error', response.response, aId+"Header");
                }
            })
            .catch(function(err){console.log("error", err)});
    } else {
        console.log("Please fill in all fields");
    }
}

// Adding event listener for the text boxes.
collectionToArray(document.getElementsByTagName('input')).forEach(element=>{
    element.addEventListener('change', ()=>{
        if (element.style.border == "1px solid red") element.style.border = "";
    });
})