window.onscroll = function () {

    var navbar = document.querySelector("nav");
    var video = document.getElementById("background-video");
    var header = document.getElementById('header');

    //make the header disappear once it encounters the navbar
    if (window.pageYOffset > video.offsetHeight) {
        header.style.top = "-80px";
        navbar.classList.add("fixed-top");
    } else {
        header.style.top = "0";
        navbar.classList.remove("fixed-top");
    }

    //animation that makes the header log move horizontally when scrolling
    if(window.pageYOffset > 10) {
        var headLogo = document.getElementById("logo-header");
        var horzLimit = window.innerWidth / 2 - 223;
        headLogo.setAttribute("style", "transform: translate(-" + (window.pageYOffset > horzLimit ? horzLimit : window.pageYOffset) + "px);");
        header.style.setProperty('box-shadow', '0 5px 15px 1px rgba(0, 0, 0, 0.4)');
    } 

    if(window.pageYOffset > 5) header.getElementsByTagName('span')[0].style.display = "none";
    else header.getElementsByTagName('span')[0].style.display = "inline";

    var offset = window.innerHeight - window.pageYOffset
    var vertLimit = convertRemToPixels(3);
    console.log('window.height : ' + window.innerHeight + ',window.pageYOffset : ' + window.pageYOffset);
    header.style.minHeight = (window.pageYOffset > 10 ? vertLimit: offset) + 'px';
    //console.log('set height : ' + (offset < vertLimit ? vertLimit : offset) + 'px !important');
}

function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

window.onload = getItems();

function getItems() {
    const method = "GET";
    var opts = { type: method, url: '/api/index-info' };
    const aPromise = callBackEnd(opts);
    aPromise
        .then((response) => {
            response.response.forEach((value, index) => {
                console.log(value)
                if (value.elements.length > 0)
                    createElementsOnLoad(value.name, value.elements);
                console.log(value.elements[0].description);
            });
        })
        .catch(err => console.log(err));
}


function createElementsOnLoad(id, newElements) {
    let searchId = id + '-btn';
    const aRef = document.getElementById(searchId);
    console.log(aRef, searchId);

    newElements.forEach(value => {
        const newDiv = document.createElement("div");
        newDiv.id = value._id;
        const title = "<h2>" + value.title + "</h2>";
        const desc = "<p>" + value.description + "</p>";
        const date = "<p>" + value.creationDate + "</p>";
        newDiv.innerHTML = title + date + "<hr />" + desc;
        aRef.parentNode.insertBefore(newDiv, aRef)
    });
}