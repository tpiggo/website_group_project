/**
 * @description Side (collpased) Navbar controller
 * @returns {void}
 */
function toggleMenu() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('expanded');

    var lis = navbar.getElementsByTagName('li');
    for (var j = 0; j < lis.length; j++) {
        lis[j].classList.toggle('appear');
    }

    var img = navbar.getElementsByTagName('img')[0];
    img.classList.toggle('appear');

    var svgs = navbar.getElementsByTagName('svg');
    svgs[0].classList.toggle('appear');
    svgs[1].classList.toggle('appear');

}

/**
 * @description Creates the dropdown menu in the main navbar and creates the collapsable side nav menu 
 * @param {String} type 
 * @param {String} id 
 * @returns {void}
 */
function dropDown(type, id) {
    var dropDown = document.getElementById(id);
    var toDisplay = dropDown.classList.contains('collapsed');

    if (toDisplay) {
        var targets = document.querySelectorAll('.' + type + ':not(collapsed)');
        for (var i = 0; i < targets.length; i++) {
            if (!targets[i].classList.contains('collapsed') && targets[i].id != id)
                targets[i].classList.add('collapsed');
        }
    }
    if (type == 'target') {
        var targets = document.querySelectorAll('.sub-target:not(collapsed)');
        for (var i = 0; i < targets.length; i++) {
            if (!targets[i].classList.contains('collapsed'))
                targets[i].classList.add('collapsed');
        }
    }

    if (type == 'nav-submenu') {
        var wrapper = document.getElementById('submenu-wrapper');
        
        if(wrapper.classList.contains('collapsed')) {
            if(toDisplay) wrapper.classList.remove('collapsed');
        } else if(!toDisplay){
            wrapper.classList.add('collapsed');
        }

        var targets = document.querySelectorAll('.nav-2nd-submenu:not(collapsed)');
        for (var i = 0; i < targets.length; i++) {
            if (!targets[i].classList.contains('collapsed'))
                targets[i].classList.add('collapsed');
        }
    }

    dropDown.classList.toggle('collapsed');

}

/**
 * @description Navabr controller, hides or shows the sidebar controller element
 * @param {String} id
 * @returns {void} 
 */
function display(id) {
    let sb = document.getElementById(id)
    sb.style.display = sb.style.display == "none"?"block":"none";
}