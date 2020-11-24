function toggleForm(name) {
    var form = document.getElementById(name);
    form.classList.toggle("hidden");

    var content = document.getElementById("center");
    content.classList.toggle("hidden");

    var buttons = content.getElementsByTagName("button");
    for(var i = 0; i < buttons.length; i++){
        buttons[i].disabled = !buttons[i].disabled;
    }
}