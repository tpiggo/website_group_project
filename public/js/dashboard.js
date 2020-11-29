//Fill in the dropdowns
window.addEventListener('load', function (event) {
    refreshDropdowns();
    // console.log('dropdowns were updated');
});

//called by the onchange functions on the dropdowns : 
function getPageSelected(mId) {
    var menu = document.getElementById(mId);
    if (menu.value) {
        var req = { id: menu.value };
        console.log(req);
        $.ajax({
            url: '/parse/' + mId.substr(3),
            data: req,
            type: 'GET',
            dataType: 'json', // added data type
            success: function (response) {
                //response = JSON.parse(response);
                if (response.status == 0) {
                    fillForm(mId.substr(3), response.posting);
                } else {
                    console.log("Error when Getting the data");
                    createPopupMsg('Error', response.response, 'pageHeader');
                }
            },
            error: function(jqXHR, exception) {
                createPopupMsg('error', "Internal Error", 'pageHeader');
            }
        });

    }
}

function fillForm(fId, content) {

    var form = document.getElementById(fId);
    for (var key in content) {

        if (key == "instructor") {
            var element = form.querySelector("[name=instructor0]");
            element.value = content.instructor[0];
            for (var i = 1; i < content.instructor.length; i++) {
                addField();
                element = form.querySelector("[name=instructor" + i + "]");
                element.value = content.instructor[i];
            }
            continue;
        }
        if (key == "termsOffered") {
            if (content[key].includes("Winter 2021")) {
                var element = form.querySelector("[name=w2021]");
                element.checked = true;
            }
            if (content[key].includes("Summer 2021")) {
                var element = form.querySelector("[name=s2021]");
                element.checked = true;
            }
            if (content[key].includes("Fall 2021")) {
                var element = form.querySelector("[name=f2021]");
                element.checked = true;
            }
            continue;
        }

        var element = form.querySelector("[name=" + key + "]");
        if (!element) continue;
        if (key == "date" || key == "start" || key == "end") {
            if(element.type == 'date') element.value = content[key].substr(0, 10);
            else element.value = content[key].substr(0, 22);
        }
        else element.value = content[key];
    }
    toggleForm(fId, 'PUT');
}


// Make the nav bar sticky at the top of the page
var nav = document.querySelector("nav");
nav.classList.add("fixed-top");
nav.setAttribute("style", "position:sticky !important");

//Display forms
function toggleForm(name, method) {
    var form = document.getElementById(name);
    form.classList.toggle("hidden");
    if (name.includes("Course")) {
        while (total > 0) {
            removeField(pointer);
        }
    }
    var content = document.getElementById("center");
    content.classList.toggle("hidden");

    var buttons = content.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = !buttons[i].disabled;
    }
    var selects = content.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        selects[i].disabled = !selects[i].disabled;
    }

    if (method) form.setAttribute('onsubmit', "handleRequest(event, $(this), '" + method + "')");

}

//Add a new input field for instructor in Course Form
var pointer = 0;
var total = 0;
function addField() {

    var previousField = document.getElementById('divInstr' + pointer);
    pointer++;
    total++;
    var newField = previousField.cloneNode(true);
    newField.id = 'divInstr' + pointer;
    newField.getElementsByTagName('input')[0].id = 'instructor' + pointer;
    newField.getElementsByTagName('input')[0].name = 'instructor' + pointer;
    newField.getElementsByTagName('input')[0].value = '';

    if (pointer == 1) {
        var minus = document.createElement('img');
        minus.src = '../images/minus.png'
        newField.getElementsByTagName('br')[0].parentNode.insertBefore(minus, newField.getElementsByTagName('input')[0].nextSibling);

    } else var minus = newField.getElementsByTagName('img')[0];

    minus.id = 'minus' + pointer;
    minus.alt = 'minus' + pointer;
    minus.setAttribute('onclick', 'removeField(' + pointer + ')');

    previousField.parentNode.insertBefore(newField, previousField.nextSibling);

}

//remove input field
function removeField(index) {
    var field = document.getElementById('divInstr' + index);
    var minus = document.getElementById('minus' + index);
    field.remove();
    minus.remove();
    if (index == pointer) pointer--;
    total--;
    if (total == 0) pointer = 0;
}

function refreshDropdowns() {

    var opts = { type: "GET", url: '/api/dashboard-info' };
    var GetData = callBackEnd(opts);

    GetData.then(response => {

        if (response.status == 0) {
            refreshDropdownCourse(response.data[0]);
            refreshDropdownNews(response.data[1]);
            refreshDropdownEvent(response.data[2]);
            refreshDropdownAward(response.data[3]);
            refreshDropdownTech(response.data[4]);
            refreshDropdownPosting(response.data[5]);

        } else if (response.status >= 1) {
            console.log("Error on sending GET request");
            createPopupMsg('error', response.response, 'center');
        }

    });

}

function refreshDropdownAward(awards) {

    var menu = document.getElementById('modAward');
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Modify Award Recipient';
    menu.add(defaultOpt);

    awards.forEach(award => {
        var option = document.createElement('option');
        option.value = award._id;
        option.text = award.title + " for " + award.recipient;
        menu.add(option);
    });
}

function refreshDropdownCourse(courses) {
    var menu = document.getElementById('modCourse');
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Modify Course';
    menu.add(defaultOpt);

    courses.forEach(course => {
        var option = document.createElement('option');
        option.value = course._id;
        option.text = course.title;
        menu.add(option);
    });
}

function refreshDropdownPosting(postings) {
    var menu = document.getElementById('modPosting');
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Modify Posting';
    menu.add(defaultOpt);

    postings.forEach(post => {
        var option = document.createElement('option');
        option.value = post._id;
        option.text = post.title + " - " + post.contact;
        menu.add(option);
    });
}

function refreshDropdownNews(news) {
    var menu = document.getElementById('modNews');
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Modify News Story';
    menu.add(defaultOpt);

    news.forEach(n => {
        var option = document.createElement('option');
        option.value = n._id;
        option.text = n.title + ' - ' + n.contact;
        menu.add(option);
    });
}

function refreshDropdownEvent(events) {
    var menu = document.getElementById('modEvent');
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Modify Events';
    menu.add(defaultOpt);

    events.forEach(event => {
        var option = document.createElement('option');
        option.value = event._id;
        option.text = event.title + " - " + event.start;
        menu.add(option);
    });
}

function refreshDropdownTech(techSupports) {
    var menu = document.getElementById('modTech');
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Modify Technical Support';
    menu.add(defaultOpt);

    techSupports.forEach(tech => {
        var option = document.createElement('option');
        option.value = tech._id;
        option.text = tech.title + " on " + tech.reportDate;
        menu.add(option);
    });
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

/**
 * @description Takes an Array of objects and returns a JSON
 * @param {Array} pObject 
 */
function makeJson(pObject) {
    var aJson = {};
    var terms = [];
    var instructors = []
    for (var i = 0; i < pObject.length; i++) {
        if (pObject[i].id != '' && pObject[i].type != 'submit') {
            var currId = pObject[i].id;

            if (currId.includes('_id') && pObject[i].value == '') continue;

            if (currId.includes('instruct')) {
                instructors.push(pObject[i].value);
            } else if (currId.includes("w2021c") || currId.includes("s2021c") || currId.includes("f2021c")) {
                if (document.getElementById(currId).checked) terms.push(pObject[i].value);
            }
            else aJson[pObject[i].name] = pObject[i].value;
        }
    }
    if (instructors.length > 0) aJson['instructor'] = instructors;
    if (terms.length > 0) aJson['termsOffered'] = terms;
    return aJson;
}

/**
 * @description Handles the errors within a json object which each element points to an element within the page
 * @param {object} pJson 
 */
function errorCheck(pObject) {
    var areErrors = false;
    Object.keys(pObject).forEach(keys => {
        // checking for blank entries,
        if (pObject[keys] == '' && document.getElementById(keys) != null) {
            areErrors = true;
            document.getElementById(keys).style.border = "solid 1px red";
        }
    });
    return areErrors;
}

/**
 * @description creates a dynamic collapsable element for the server response.
 * @param {*} type 
 * @param {*} msgText 
 * @todo:   Maybe this should check if a popup exists there already, if it does remove it.
 *          Or create popups which only live for 3 seconds?
 */
function createPopupMsg(pType, pMsgText, pHeaderId) {
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
    const aHeader = document.getElementById(pHeaderId);
    // Remove an old popup
    if (aHeader.nextElementSibling.getAttribute('type') == 'popup-msg') {
        aHeader.parentNode.removeChild(aHeader.nextSibling);
    }
    aHeader.parentNode.insertBefore(aDiv, aHeader.nextSibling);
    fade(aDiv);
}

function fade(div) {
    setTimeout(function () {
        div.remove();
    }, 4000);
}

/**
 * 
 * @param {Event} event 
 * @param {HTMLElement} element 
 * @param {String} method 
 */
function handleRequest(event, element, method) {
    // Do not allow default.
    event.preventDefault();
    // Building the request JSON
    var mForm = makeJson(element[0]);
    if (!errorCheck(mForm)) {
        // clear each one!
        // Create the async promise
        var opts = { type: method, url: '/parse/' + element[0].id, request: mForm };
        var aPromise = callBackEnd(opts);
        // Handle
        aPromise
            .then(function (response) {
                // Returning element to its JSON format
                var aId = element[0].id;
                // response = JSON.parse(response);
                // console.log(response);
                if (response.status == 0) {
                    if (method != 'PUT') document.getElementById(element[0].id).reset();
                    refreshDropdowns();
                    createPopupMsg('success', response.response, aId + "Header");
                } else if (response.status >= 1) {
                    console.log("Error on submission");
                    // Creating Element to display in the form!
                    createPopupMsg('error', response.response, aId + "Header");
                }
            })
            .catch(function (err) { console.log("error", err) });
    } else {
        console.log("Please fill in all fields");
    }
}

// Adding event listener for the text boxes.
collectionToArray(document.getElementsByTagName('input')).forEach(element => {
    element.addEventListener('change', () => {
        if (element.style.border == "1px solid red") element.style.border = "";
    });
})