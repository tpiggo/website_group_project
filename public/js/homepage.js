window.onscroll = function() {
    var navbar = document.getElementById("navbar");
    var video = document.getElementById("background-video");
    if (window.pageYOffset + navbar.offsetHeight > video.offsetHeight) {
        document.documentElement.style.setProperty('--top-header', '-67px');
        navbar.classList.add("fixed-top");
        navbar.classList.add("scrolled");
    } else {
        document.documentElement.style.setProperty('--top-header', '0');
        navbar.classList.remove("fixed-top");
        navbar.classList.remove("scrolled");
    }
}