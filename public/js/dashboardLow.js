var formOpened = [];
/**
 * @description Renders or creates a form
 * @param {Event} event 
 */
function requestLevel(event){
    let parentNode = event.target.parentElement;
    var requestForm;
    if (formOpened.length > 0){
        requestForm = formOpened.pop();
    } else {
        requestForm = document.createElement('form')
        requestForm.id = "request-form"
        let user = event.target.getAttribute("user");
        requestForm.setAttribute("onsubmit", "handleUserRequest(event, '"+user+"')");
        requestForm.innerHTML = `<h3 id="requestLevelHeader">Request Higher Level</h3><div class="form-group">
            <textarea class="form-control" id="reason" aria-describedby="reasonText" placeholder="Why are you requesting higher level?"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Request</button>`
    }
    parentNode.appendChild(requestForm);
    event.target.disabled = true;
    // create close button 
    var closeBtn = document.createElement('button');
    closeBtn.className = "close";
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = `<span aria-hidden="true">&times;</span>`
    closeBtn.setAttribute('onclick', "clickClose(event)");
    requestForm.appendChild(closeBtn);
}

/**
 * @description Closes a form and saves it
 * @param {Event} event 
 */
function clickClose(event) {
    let form = event.target.parentElement.parentElement;
    form.reset();
    formOpened.push(form);
    console.log(form);
    form.parentElement.removeChild(form);
    document.getElementById("request-button").disabled = false;
}

/**
 * @description 
 * @param {Event} event 
 */
function handleUserRequest(event, user) {
    event.preventDefault();
    if (document.getElementById("reason").value == ""){
        createPopupMsg('error', "Please fill in the reason!", "requestLevelHeader");
        // Stop the execution
        return;
    }
    const values = {user: user, reason: document.getElementById("reason").value};
    var opts = { type: "POST", url: '/users/requestLevel', request: values , contentType: "JSON"};
    var aPromise = callBackEnd(opts);
    // Handle
    aPromise
        .then(function (response) {
            if (response.status == 0) {
                createPopupMsg('success', response.response, "requestLevelHeader");
            } else if (response.status >= 1) {
                console.log("Error on submission");
                // Creating Element to display in the form!
                createPopupMsg('error', response.response, "requestLevelHeader");
            } else {
                console.log(response)
            }
        })
        .catch(function (err) { console.log("error", err) });
}