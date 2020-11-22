var errors = [true, true, true, true];
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
 */
function initErrorBoxes(){
    // jQuery to create the boxes for easy use.
    var errorMsg;
    $.each($(".form-item .error"), (i,l)=>{
        if (i==0) errorMsg = 'Username is invalid!';
        else if (i == 1) errorMsg = 'Password must be 6 characters long';
        else if (i == 2) errorMsg = 'Passwords do not match!';
        else errorMsg = 'Must be a McGill email!';
        errorBox.push(new UserError(l, errorMsg));
    });
}  

window.onload = initErrorBoxes();

/**
 * @author Timothy
 * @param {Object} form_entry 
 * @description Check if the username is the proper type. Outputs errors if not.
 */
function checkUser(form_entry){
    if (form_entry.value == " " || form_entry.value == ""){
        errorBox[0].getElement().innerHTML = errorBox[0].getErrorMsg();
        errors[0] = true;
    } else{
        errorBox[0].getElement().innerHTML = "";
        errors[0] = false;
    }
}

/**
 * @author Timothy
 * @param {Boolean} isPass 
 * @param {Object} form_entry 
 * @description Comprehensive checking of the password/confirmation password, with proper 
 *              error output.
 */
function checkPass(isPass, form_entry){
    // Checking password or confirmation password
    if (isPass){
        var pass = form_entry.value;
        // Making sure the password is proper length and does not have spaces
        if (pass.length < 5 || pass.includes(' ')){
            errorBox[1].getElement().innerHTML = errorBox[1].getErrorMsg();
            errors[1] = true;
        } else {
            // Checking the confirmation password (if there is one)
            errorBox[1].getElement().innerHTML = "";
            errors[1] = false;
            var confPass = document.getElementById("confirm-password");
            if (confPass.value != '' && !matchPass(pass, confPass.value)){
                errorBox[2].getElement().innerHTML = errorBox[2].getErrorMsg();
                errors[2] = true;
                console.log(pass + "    "+ confPass.value);
            } else if (confPass != '' && matchPass(pass, confPass.value)){
                errorBox[2].getElement().innerHTML = "";
                errors[2] = false;
            } else{
                errors[2] = true;
            }
        }
    } else {
        // Check confirmation pass with the true pass.
        var pass = document.getElementById('password').value;
        var confPass = form_entry.value
        if(matchPass(pass, confPass) && confPass != ''){
            errorBox[2].getElement().innerHTML = '';
            errors[2] = false;
        } else if (matchPass(pass, confPass) && confPass == '') {
            // Bad pass even though it does technically match
            errors[2] = true;
        } else {
            errorBox[2].getElement().innerHTML = errorBox[2].getErrorMsg();
            errors[2] = true;
        }
        
    }
    return false;
}

/**
 * 
 * @param {Object} form_entry 
 * @description Checks the validity of the email entered with a simple pattern matcher
 */
function checkEmail(form_entry){
    if (form_entry.value.includes('mcgill.ca') && isEmailRegex.test(form_entry.value)){
        errorBox[3].getElement().innerHTML = "";
        errors[3] = false;
    } else {
        errorBox[3].getElement().innerHTML = errorBox[3].getErrorMsg();
        errors[3] = true;
    }
}

/**
 * @author Timothy
 * @param {String} pass 
 * @param {String} confPass 
 * @description Function which takes in password and confirmation and matches them 
 */
function matchPass(pass, confPass){
    if (pass == confPass){
        return true;
    }
    return false;
}

/**
 * @author Timothy
 * @description Finds errors on the page.
 */
function areErrors(){
    for (var i = 0; i<errors.length; i++){
        if (errors[i]){
            return true;
        }
    }
    return false;
}


/**
 * @author Timothy
 * @param {Array} form
 * @description Function to push the errors to the page in case bad submission (empty)
 */
function onSubmitErrors(form){
    
    for (var i = 0; i < form.length; i++){
        if (i == 2 && errors[i] && errors[i-1]){
            errorBox[i].getElement().innerHTML = errorBox[i-1].getErrorMsg();
        }
        else if (errors[i]){
            errorBox[i].getElement().innerHTML = errorBox[i].getErrorMsg();
        }
    }
    console.log(errors);
}


function onSubmit(event, value){
    if (areErrors()){
        onSubmitErrors(value);
        event.preventDefault();
    }
}