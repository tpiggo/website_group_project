var errors = [false, false, false, false, true, false];
var errorBox = [];
const isEmailRegex = /\S+@\S+\.\S+/;
// User defined Error object
class UserError{
    constructor(element, msg){
        this.element = element;
        this.msg = msg;
    }
    getElement(){
        return this.element;
    }
    getErrorMsg(){
        return this.msg;
    }
}



/**
 * @description Initializes the error boxes in order to be eaily referenced from other sections of the code
 *              The error boxes are objects
 * @returns {void}
 */
function initErrorBoxes(){
    // jQuery to create the boxes for easy use.
    var errorMsg;
    $.each($(".form-item .error"), (i,l)=>{
        if (i==0) errorMsg = 'Username is invalid!';
        else if (i == 1) errorMsg = 'Password must be 6 characters long';
        else if (i == 2) errorMsg = 'Passwords do not match!';
        else if (i == 3) errorMsg = 'Must be a McGill email!';
        else errorMsg = 'Cannot be empty!';
        errorBox.push(new UserError(l, errorMsg));
    });
}  


initErrorBoxes();

/**
 * @param {Object} pFormEntry 
 * @description Check if the username is the proper type. Outputs errors if not.
 * @returns {void}
 */
function checkUser(pFormEntry){
    if (pFormEntry.value == " "){
        errorBox[0].getElement().innerHTML = errorBox[0].getErrorMsg();
        errors[0] = true;
    } else {
        errorBox[0].getElement().innerHTML = "";
        errors[0] = false;
    }
}

/**
 * @param {String} pass 
 * @param {String} confPass 
 * @description Function which takes in password and confirmation and matches them
 * @returns {void}
 */
function matchPass(pass, confPass){
    if (pass == confPass){
        return true;
    }
    return false;
}

/**
 * @param {Boolean} isPass 
 * @param {Object} pFormEntry 
 * @description Comprehensive checking of the password/confirmation password, with proper 
 *              error output.
 * @returns {void}
 */
function checkPass(isPass, pFormEntry){
    // Checking password or confirmation password
    var pass;
    var confPass;
    if (isPass){
        pass = pFormEntry.value;
        confPass = document.getElementById("confirm-password");
        // Making sure the password is proper length and does not have spaces
        if (pass != ''){
            if (pass.length < 5 || pass.includes(' ')){
                errorBox[1].getElement().innerHTML = errorBox[1].getErrorMsg();
                errors[1] = true;
            } else {
                // Checking the confirmation password (if there is one)
                errorBox[1].getElement().innerHTML = "";
                errors[1] = false;
                if (confPass.value != '' && !matchPass(pass, confPass.value)){
                    errorBox[2].getElement().innerHTML = errorBox[2].getErrorMsg();
                    errors[2] = true;
                } else if (confPass != '' && matchPass(pass, confPass.value)){
                    errorBox[2].getElement().innerHTML = "";
                    errors[2] = false;
                } else {
                    errors[2] = true;
                }
            }
        } else {
            if (matchPass(pass, confPass.value)) {
                errorBox[2].getElement().innerHTML = "";
                errors[2] = false;
            }  
        }
    } else {
        // Check confirmation pass with the true pass.
        pass = document.getElementById('password').value;
        confPass = pFormEntry.value
        if(matchPass(pass, confPass)){
            errorBox[2].getElement().innerHTML = '';
            errors[2] = false;
        } else {
            errorBox[2].getElement().innerHTML = errorBox[2].getErrorMsg();
            errors[2] = true;
        }
        
    }
    return false;
}

/**
 * @param {Object} pFormEntry 
 * @description Checks the validity of the email entered with a simple pattern matcher
 * @returns {void}
 */
function checkEmail(pFormEntry){
    if (pFormEntry.value != ''){
        if (pFormEntry.value.includes('mcgill.ca') && isEmailRegex.test(pFormEntry.value)){
            errorBox[3].getElement().innerHTML = "";
            errors[3] = false;
        } else {
            errorBox[3].getElement().innerHTML = errorBox[3].getErrorMsg();
            errors[3] = true;
        }
    } else {
        errorBox[3].getElement().innerHTML = "";
        errors[3] = false;
    }
}

/**
 * @description changes the theme of the page in order to show off the users desired new theme
 * @param {HTMLElement} element 
 * @returns {void}
 */
function themeChange(element){
    let selected = element.value;
    if (document.body.className != selected){
        document.body.className = selected;
    }
}

/**
 * @description gets the data from the pFormEntry and renders the approriate error message if it does not match
 * @param {HTMLElement} pFormEntry
 * @returns {void}
 */
function currentPass(pFormEntry){
    if (pFormEntry.value == ''){
        errorBox[4].getElement().innerHTML = errorBox[4].getErrorMsg();
        errors[4] = true;
    } else {
        errorBox[4].getElement().innerHTML ="";
        errors[4] = false;
    }
    return errors[4];
}

/**
 * @description Adds the errors to all the elements which have errors
 * @returns {void}
 */
function addErrors(){
    for (var i = 0; i < errors.length; i++){
        if (errors[i]){
            errorBox[i].getElement().innerHTML = errorBox[i].getErrorMsg();
        }
    }
}

/**
 * @description checks for possible errors 
 * @returns {void}
 */
function checkErrors(){
    for (var element in errors){
        if (errors[element]) return true;
    }
    return false;
}

/**
 * @description Handles the onSubmit event on the settings page
 * @param {Event} event 
 */
function onSubmit(event){
    if (currentPass(document.getElementById('current-password')) || checkErrors() ){
        console.log("Error on the page");
        addErrors()
        event.preventDefault();
    }
}

