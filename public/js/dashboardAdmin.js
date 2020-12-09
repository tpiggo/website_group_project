//Fill in the dropdowns
window.addEventListener('load', function (event) {
    getUserRequests();
});

/**
 * @description Requests all user requests using the API
 * @returns {void}
 */
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

/**
 * @description Refreshing dropdowns by getting the data and pushing it into the proper dropdown
 * @param {JSON} requests
 * @returns {void}
 */
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

/**
 * @description Getting user information from the server and rendering on the frontend
 * 
 * @returns {void}
 */
function getUserRequestForm() {
    var menu = document.getElementById('requests-dropdown');
    if (menu.value) {
        var req = { id: menu.value };
        $.ajax({
            url: '/parse/user-requests',
            data: req,
            type: 'GET',
            dataType: 'json', // added data type
            success: function (response) {
                //response = JSON.parse(response);
                if (response.status == 0) {
                    fillUserForm(response.request);
                    toggleForm('user-requests', 'PUT', false);
                } else {
                    // Error occurred Create popup
                    console.log("Error when Getting the data");
                    createPopupMsg('Error', response.response, 'pageHeader');
                }
            },
            error: function (jqXHR, exception) {
                createPopupMsg('error', "Internal Error", 'pageHeader');
            }
        });
    }
}

/**
 * @description Fill user form with the users information
 * @param {JSON} userRequest 
 * @returns {void}
 */
function fillUserForm(userRequest) {
    document.getElementById('user-username').innerText = userRequest.username;
    document.getElementById('user-email').innerText = userRequest.email;
    document.getElementById('user-message').innerText = userRequest.message;

    var menu = document.getElementById('type-radio-menu');
    menu.innerHTML = '';
    var userType = userRequest.userType;
    for (var type = userType; type < 4; type++) {
        var input = document.createElement('input');
        input.class = "form-check-input";
        input.type = "radio";
        input.name = "userType";
        input.id = "userType" + type;
        input.value = type;

        var label = document.createElement('label');
        label.class = "form-check-label";
        label.for = input.id;
        label.innerText = "Level " + type;
        menu.appendChild(input);
        menu.appendChild(label);
        menu.appendChild(document.createElement('br'));
    }

    document.getElementById('username-field').value = userRequest.username;
    document.getElementById('ur_id').value = document.getElementById('requests-dropdown').value;


}