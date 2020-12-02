// Make the nav bar sticky at the top of the page
var nav = document.querySelector("nav");
nav.classList.add("fixed-top");
nav.setAttribute("style", "position:sticky !important");

//Disable the nav item corresponding to the 'title' of the page
var items = nav.getElementsByClassName("nav-item");
 for(var i = 2; i < items.length; i++) {
    var link = items[i].getElementsByClassName('nav-link');
    if(link != undefined) {
        if(link[0].innerText == document.querySelector("#title").innerText) {
            link[0].classList.add("disabled");
        }
    }
}

// Open and close the left menu with onclick() (hamburger icon)
function openMenu() {
    document.getElementById('menu').classList.toggle('hidden');
    document.getElementById('content').classList.toggle('hidden');
}


// function onLoad(){
//     const titleSpan = document.getElementById('title');
//     if (titleSpan.innerHTML == 'Login' || titleSpan.innerHTML == 'Register'){
//         document.getElementById('icon').hidden = true;
//     }
// }