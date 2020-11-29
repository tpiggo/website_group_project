window.onscroll = function () {
    
    var navbar = document.querySelector("nav");
    var video = document.getElementById("background-video");
    
    //make the header disappear once it encounters the navbar
    if (window.pageYOffset> video.offsetHeight) {
        document.documentElement.style.setProperty('--top-header', '-80px');
        navbar.classList.add("fixed-top");
    } else {
        document.documentElement.style.setProperty('--top-header', '0');
        navbar.classList.remove("fixed-top");
    }

    //animation that makes the header log move horizontally when scrolling
    var headLogo = document.getElementById("logo-header");
    var limit = window.innerWidth/2 - 223;
    headLogo.setAttribute("style", "transform: translate(-" + (window.pageYOffset>limit ? limit : window.pageYOffset) + "px);" );

}

window.onload = getItems();

function getItems(){
    const method = "GET";
    var opts = { type: method, url: '/api/index-info' };
    const aPromise = callBackEnd(opts);
    aPromise
        .then((response) => {
            response.response.forEach((value, index) =>{
                console.log(value)
                if (value.elements.length > 0)
                    createElementsOnLoad(value.name, value.elements);
                console.log(value.elements[0].description);
            });
        })
        .catch(err => console.log(err));
}


function createElementsOnLoad(id, newElements){
    let searchId = id+'-btn';
    const aRef = document.getElementById(searchId);
    console.log(aRef, searchId);

    newElements.forEach(value => {
        const newDiv = document.createElement("div");
        newDiv.id = value._id;
        const title = "<h2>"+value.title+"</h2>";
        const desc = "<p>" + value.description +"</p>";
        const date = "<p>" + value.creationDate + "</p>";
        newDiv.innerHTML = title + date + "<hr />" + desc;
        aRef.parentNode.insertBefore(newDiv ,aRef)
    });
}