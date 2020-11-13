document.querySelector("nav").setAttribute("style", "position:sticky");
var icon = document.getElementById('icon');
if (icon) {
    icon.addEventListener('click', openMenu);
}

function openMenu() {
    document.getElementById('menu').classList.toggle('hidden');
    document.getElementById('content').classList.toggle('hidden2');
}