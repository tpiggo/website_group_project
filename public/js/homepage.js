
var prosp = document.getElementById('navbar');
document.getElementById('body-content').before(prosp);

window.addEventListener('scroll', () => {

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

    // document.body.style.setProperty('--scroll',window.pageYOffset / (3*window.innerHeight/2));

    //animation that makes the header log move horizontally when scrolling
    if (window.pageYOffset > 10) {
        var headLogo = document.getElementById("logo-header");
        var horzLimit = window.innerWidth / 2 - 223;
        headLogo.setAttribute("style", "transform: translate(-" + (window.pageYOffset > horzLimit ? horzLimit : window.pageYOffset) + "px);");
        header.style.setProperty('box-shadow', '0 5px 15px 1px rgba(0, 0, 0, 0.4)');
    }
});

function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

getItems();

function getItems() {
    const method = "GET";
    var opts = { type: method, url: '/api/index-info' };
    const aPromise = callBackEnd(opts);
    aPromise
        .then((response) => {
            response.response.forEach((value, index) => {
                if (value.elements.length > 0)
                    createElementsOnLoad(value.name, value.elements);
            });
        })
        .catch(err => console.log(err));
}


function createElementsOnLoad(id, newElements) {
    //let searchId = id + '-btn';
    let searchId = id + '-cards';
    const cardDeck = document.getElementById(searchId);

    newElements.forEach(value => {
        const newDiv = document.createElement("div");
        newDiv.id = value._id;
        newDiv.classList.add("card", "bg-light", "card-content");

        newDiv.innerHTML = `
        <div class="card-header"><h3 class="card-title"> ${value.title}</h3></div></div>
        <div class="card-body">
        <p class="card-text"><small class="text-muted">${value.creationDate.substr(0, 9)}</small></p>
            <p class="card-text">${value.description}</p>
        </div>
        `;
        cardDeck.appendChild(newDiv);
    });
}