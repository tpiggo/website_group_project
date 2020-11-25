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
    for (var i = 0; i< aObject.length; i++){
        if (aObject[i].id != '' && aObject[i].type != 'submit') aJson[aObject[i].id] = aObject[i].value;
    }
    return aJson;
}

function errorCheck(aJson){
    var areErrors = false;
    Object.keys(aJson).forEach(keys=>{
        // checking for blank entries,
        if (aJson[keys] == '') {
            areErrors = true
            document.getElementById(keys).style.border = "solid 1px red";
        }
    });
    return areErrors;
}


function handleRequest(event, element){
    // Do not allow default.
    event.preventDefault();
    // Buidling the request JSON
    var mForm = makeJson(element[0]);
    if (!errorCheck(mForm)){
        // clear each one!
        // Create the async promise
        const opts = {type: "POST", url: '/parse/'+element[0].id, request: mForm};
        const aPromise = callBackEnd(opts);
        // Handle
        aPromise
            .then(function(response){
                console.log(response)
                Object.keys(mForm).forEach(key=>{
                    document.getElementById(key).value = '';
                });
            })
            .catch(function(err){console.log("error", err)});
    } else {
        console.log("there are errors");
    }
}

// Adding event listener for the text boxes!
collectionToArray(document.getElementsByTagName('input')).forEach(element=>{
    element.addEventListener('change', ()=>{
        if (element.style.border == "1px solid red") element.style.border = "";
    });
})