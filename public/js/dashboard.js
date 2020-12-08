//Fill in the dropdowns
window.addEventListener('load', function (event) {
    refreshDropdowns();
    getUserRequests();
    // console.log('dropdowns were updated');
});

function getUserRequests() {

    var opts = { type: "GET", url: '/api/user-requests' };
    var GetData = callBackEnd(opts);

    GetData.then(response => {

        if (response.status == 0) {
            refreshDropdownRequestUsers(response.requests);
        } else if (response.status >= 1) {
            console.log("Error on sending GET request");
            createPopupMsg('error', response.response, 'center');
        }

    });

}

function refreshDropdownRequestUsers(requests) {

    var menu = document.getElementById('requests-dropdown');
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'See User Requests';
    menu.add(defaultOpt);

    requests.forEach(request => {
        var option = document.createElement('option');
        option.value = request._id;
        option.text = request.username + " of Level " + request.userType;
        menu.add(option);
    });
}

function getUserRequestForm() {
    var menu = document.getElementById('requests-dropdown');
    if (menu.value) {
        var req = { id: menu.value };
        console.log(req);
        $.ajax({
            url: '/parse/user-requests',
            data: req,
            type: 'GET',
            dataType: 'json', // added data type
            success: function (response) {
                //response = JSON.parse(response);
                if (response.status == 0) {
                    fillUserForm(response.request);
                    toggleForm('user-requests','PUT', false);
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

function fillUserForm(userRequest) {
    document.getElementById('user-username').innerText = userRequest.username;
    document.getElementById('user-email').innerText = userRequest.email;
    document.getElementById('user-message').innerText = userRequest.message;

    var menu =  document.getElementById('type-radio-menu');
    menu.innerHTML = '';
    var userType = userRequest.userType;
    for(var type = userType ; type < 4; type++) {
        var input = document.createElement('input');
        input.class = "form-check-input";
        input.type= "radio";
        input.name="userType";
        input.id = "userType" + type;
        input.value = type;

        var label = document.createElement('label');
        label.class = "form-check-label";
        label.for= input.id;
        label.innerText = "Level " + type;
        menu.appendChild(input);
        menu.appendChild(label);
        menu.appendChild(document.createElement('br'));
    }

    document.getElementById('username-field').value= userRequest.username;
    document.getElementById('ur_id').value = document.getElementById('requests-dropdown').value;
    

}

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

//element declared multiple time
function fillForm(fId, content) {
    const hasFile = fId=='Course'?true:false;
    var form = document.getElementById(fId);
    for (var key in content) {

        if (key == "instructor") {
            var instElement = form.querySelector("[name=instructor0]");
            instElement.value = content.instructor[0];
            for (var i = 1; i < content.instructor.length; i++) {
                addField();
                instElement = form.querySelector("[name=instructor" + i + "]");
                instElement.value = content.instructor[i];
            }
            continue;
        }
        else if (key == "termsOffered") {
            if (content[key].includes("Winter 2021")) {
                var winter = form.querySelector("[name=w2021]");
                winter.checked = true;
            }
            else if (content[key].includes("Summer 2021")) {
                var summer = form.querySelector("[name=s2021]");
                summer.checked = true;
            }
            else if (content[key].includes("Fall 2021")) {
                var fall = form.querySelector("[name=f2021]");
                fall.checked = true;
            }
            continue;
        }
        if (key == 'syllabus') continue;

        var element = form.querySelector("[name=" + key + "]");
        if (!element) continue;
        if (key == "date" || key == "start" || key == "end") {
            if(element.type == 'date') element.value = content[key].substr(0, 10);
            else element.value = content[key].substr(0, 22);
        }
        else element.value = content[key];
    }
    toggleForm(fId, 'PUT', hasFile);
}


// Make the nav bar sticky at the top of the page
var nav = document.querySelector("nav");
nav.classList.add("fixed-top");
nav.setAttribute("style", "position:sticky !important");

//Display/Hide forms
function toggleForm(name, method, hasFile) {
    var form = document.getElementById(name);
    // Hides the garbage that 
    form.classList.toggle("hidden");
    if (!form.className.includes("hidden")){
        for (let child of form.children){
            let idString = name.toLowerCase();
            if ( child.id == `delete-${idString}`){
                child.style="visibility: hidden;";
            }
        }

        //Hard coding the position of the forms on the windonw
        setFormPosition(form);

    }
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
    for (var j = 0; j < selects.length; j++) {
        selects[j].disabled = !selects[j].disabled;
    }
    if (method == "PUT"){
        form.setAttribute('onsubmit', `handleRequest(event, $(this), '${method}', ${hasFile})`);
        for (let child of form.children){
            let idString = name.toLowerCase();
            if ( child.id == `delete-${idString}`){
                child.style="visibility: visible;";
            }
        }
    } else {
        form.setAttribute('onsubmit', `handleRequest(event, $(this), '${method}', ${hasFile})`);
        form.reset();
    }

}

function setFormPosition(form) {

    var wrapper = document.getElementById('form-wrap');
        var navHeight = document.getElementsByTagName('nav')[0].offsetHeight;
        var contentHeight = document.getElementById('content').offsetHeight;
        var contentWidth = document.getElementById('content').offsetWidth;

        var topOffset = navHeight + contentHeight/2 - form.offsetHeight/2;
        var topPercentage = (topOffset/ window.innerHeight) * 100;
        console.log(window.innerHeight + 'top percentage: ' + topPercentage);

        var leftOffet = contentWidth/2 - form.offsetWidth/2;
        var leftPercentage = (leftOffet/ window.innerWidth) * 100;
        console.log('left percentage: ' + leftPercentage);

        wrapper.style.setProperty('top', topPercentage+ '%');
        wrapper.style.setProperty('left', leftPercentage + '%');

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
    
    var minus;
    if (pointer == 1) {
        minus = document.createElement('img');
        minus.src = '../images/icons/minus.png'
        newField.getElementsByTagName('br')[0].parentNode.insertBefore(minus, newField.getElementsByTagName('input')[0].nextSibling);

    } else minus = newField.getElementsByTagName('img')[0];

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
            refreshDropDownSubpages(response.data[6]);
            refreshDropDownPages(response.data[7]);
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

function refreshDropDownPages(pages) {
    var menu = document.getElementById('select_category');
    if(!menu){
        return;
    }
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Category';
    menu.add(defaultOpt);
    pages.forEach(page => {
        var option = document.createElement('option');
        option.value = page._id;
        option.text = page.title;
        menu.add(option);
    })
}

function refreshDropDownSubpages(subpages) {
    var menu = document.getElementById('select_page');
    if(!menu){
        return;
    }
    menu.innerHTML = '';
    var defaultOpt = document.createElement('option');
    defaultOpt.text = 'Page';
    menu.add(defaultOpt);
    var category;
    var group;
    subpages.forEach(page => {
        if(page.subpages && page.subpages.length > 0){
            return;
        }
        var new_category = page.path.replace(/\/.+/,'');
        if(category != new_category){
            category = new_category;
            group = document.createElement('optgroup');
            group.label = category;
            menu.add(group);
        }
        var option = document.createElement('option');
        option.value = page._id;
        option.text = page.path.replace(/.+\//,'');
        group.appendChild(option);
    });
}

/**
 * @description Takes an Array of objects and returns a JSON
 * @param {Array} pObject 
 */
function makeJson(pObject) {
    console.log(pObject);
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
            } else if(pObject[i].type =="radio") {
                if(document.getElementById(currId).checked) aJson[pObject[i].name] = pObject[i].value;
                else continue;
            } 

            else aJson[pObject[i].name] = pObject[i].value;
        }
    }
    if (instructors.length > 0) aJson['instructor'] = instructors;
    if (terms.length > 0) aJson['termsOffered'] = terms;
    console.log(aJson);
    return aJson;
}

/**
 * @description Takes an Array of objects and returns FormData object
 * @param {Array} pObject 
 */
function createForm(pObject){
    var formData = new FormData
    var terms = [];
    var instructors = []
    for (var i = 0; i < pObject.length; i++) {
        if (pObject[i].id != '' && pObject[i].type != 'submit') {
            var currId = pObject[i].id;
            
            if (currId.includes('_id') && pObject[i].value == '') continue;
            if (pObject[i].type == 'file'){ 
                formData.append(pObject[i].name, pObject[i].files[0]);
            } else if (currId.includes('instruct')) {
                instructors.push(pObject[i].value);
            } else if (currId.includes("w2021c") || currId.includes("s2021c") || currId.includes("f2021c")) {
                if (document.getElementById(currId).checked) terms.push(pObject[i].value);
            }
            else {
                formData.append(pObject[i].name, pObject[i].value);
            }
        }
    }
    if (instructors.length > 0) formData.append('instructor', instructors);
    if (terms.length > 0) formData.append('termsOffered', terms);
    return formData;
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
 * 
 * @param {Event} event 
 * @param {HTMLElement} element 
 * @param {String} method 
 */
function handleRequest(event, element, method, hasFile) {
    // Do not allow default.
    event.preventDefault();
    console.log(element);
    // Building the request JSON
    var mForm, type;
    if (hasFile){
        mForm = createForm(element[0]);
        type = 'FormData';
    } else {
        mForm = makeJson(element[0]);
        type = 'JSON';
    }
    
    if (!errorCheck(mForm)) {
        // clear each one!
        // Create the async promise
        var opts = { type: method, url: '/parse/' + element[0].id, request: mForm , contentType: type};
        var aPromise = callBackEnd(opts);
        // Handle
        aPromise
            .then(function (response) {
                var aId = element[0].id;
                console.log('id form ' + aId);
                if (response.status == 0) {
                    if (method != 'PUT') document.getElementById(element[0].id).reset();
                    refreshDropdowns();
                    if(aId=="user-requests") getUserRequests();
                    createPopupMsg('success', response.response, aId + "Header");
                } else if (response.status >= 1) {
                    console.log("Error on submission");
                    console.log(response.response);
                    // Creating Element to display in the form!
                    createPopupMsg('error', response.response, aId + "Header");
                } else {
                    console.log(response)
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
});

/**
 * @description  
 * @param {HTMLElement} element
 * @returns {null}
 */
function deleteButton(event, element){
    // preventing the default action since it SOMEHOW magically propogates to the other button....
    event.preventDefault();
    let id;
    let parentElement = element.parentElement;
    for (let el of parentElement.children){
        if (el.name == '_id'){
            id = el.value;
            break;
        }
    }
    var opts = { type: "DELETE", url: '/parse/' + parentElement.id, request: {_id: id} , contentType: "JSON"};
    const aPromise = callBackEnd(opts);
    aPromise
        .then(result=>{
            console.log(result);
            if (result.status == 0){
                createPopupMsg('success', result.response, parentElement.id + "Header");
                refreshDropdowns();
                if( parentElement.id =='user-requests') getUserRequests();
                parentElement.reset();
            } else {
                createPopupMsg('error', result.response, parentElement.id + "Header");
            }
        })
        .catch(err=>console.log(err));
}   