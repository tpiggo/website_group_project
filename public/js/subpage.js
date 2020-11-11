document.querySelector("nav").classList.add("fixed-top");
var icon = document.getElementById('icon');
if (icon) {
    icon.addEventListener('click', openMenu);
}

function openMenu() {
    document.getElementById('menu').classList.toggle('collapsed');
    document.getElementById('content').classList.toggle('collapsed2');
}