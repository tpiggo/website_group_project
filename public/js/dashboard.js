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

function callBackEnd(opts){
    // Promisifying the callback in order to handle it asynchoronously.
    return new Promise((resolve, reject)=>{
        var aXML = new XMLHttpRequest();
        aXML.open(opts.type, opts.url);
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
        aXML.send(JSON.stringify(opts.request));
    })
}

function collectionToArray(pColl){
    var aCol = [];
    for (var i = 0; i < pColl.length; i++){
        aCol.push(pColl[i]);
    }
    return aCol;
}

function makeJson(aObject){
    var aJson = {};
    var terms = [];
    var instructors = []
    for (var i = 0; i< aObject.length; i++){
        if (aObject[i].id != '' && aObject[i].type != 'submit') {
            var currId = aObject[i].id;
            
            if(currId.includes('instruct')) {
                instructors.push(aObject[i].value);
            } else if (currId == "w2021c" || currId == "s2021c" || currId == "f2021c") {
                if(document.getElementById(currId).checked) terms.push(aObject[i].value);
            }
            
            else aJson[aObject[i].id] = aObject[i].value;
        }
    }
    if(instructors.length >0) aJson['instructors'] = instructors;
    if(terms.length > 0) aJson['termsOffered'] = terms;
    return aJson;
}

function errorCheck(aJson){
    var areErrors = false;
    Object.keys(aJson).forEach(keys=>{
        // checking for blank entries,
        if (aJson[keys] == '' && document.getElementById(keys) != null) {
            areErrors = true;
            document.getElementById(keys).style.border = "solid 1px red";
        }
    });
    return areErrors;
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
                console.log(response)
                document.getElementById(element[0].id).reset();
                // Object.keys(mForm).forEach(key=>{
                //     document.getElementById(key).value = '';
                // });
            })
            .catch(function(err){console.log("error", err)});
    } else {
        console.log("Please fill in all fields");
    }
}

// Adding event listener for the text boxes!
collectionToArray(document.getElementsByTagName('input')).forEach(element=>{
    element.addEventListener('change', ()=>{
        if (element.style.border == "1px solid red") element.style.border = "";
    });
})