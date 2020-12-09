// Make the nav bar sticky at the top of the page
var nav = document.querySelector("nav");
nav.classList.add("fixed-top");
nav.setAttribute("style", "position:sticky !important");

document.body.style.setProperty('--nav-height', (nav.offsetHeight) + 'px');

var submenus = document.getElementsByClassName('submenu');

// Goes through the subpage menus and renders them but pushes them into the hidden
for (var i = 0; i < submenus.length; i++) {
    var selected = document.querySelector('#submenu' + submenus[i].id);
    selected.addEventListener('mouseenter', function () {
        $(this).find("ul:nth-child(2)").removeClass("hidden");

    });

    selected.addEventListener('mouseleave', function () {
        $(this).find("ul:nth-child(2)").addClass("hidden");

    });
}