var pages; 
let reportContainer = document.getElementById("report-container");
/**
 * @description Creates the pages which are listed in the page table
 * @returns {void}
 */
window.onload = () => {
    pages = collectionToArray(document.getElementsByClassName("page-item"));
    pages = pages.slice(1, pages.length-1);
}

/**
 * @description toggles the pages by getting the prev and toggles the active page
 *  enables next if it is disabled currently and diables prev if its the prev element
 * @returns {void}
 */
function getPrev(){
    var currentPage = document.getElementsByClassName("page-item active")[0];
    currentPage.classList.toggle("active");
    // toggle the current slide to be unviewable;
    var currentSlide = document.getElementById( currentPage.firstElementChild.getAttribute("data-element") );
    currentSlide.style.display = "none";
    isNextBtn(currentPage);
    currentPage = currentPage.previousElementSibling;
    currentPage.classList.toggle("active");
    // toggles the current page (new page) to be viewable
    currentSlide = document.getElementById( currentPage.firstElementChild.getAttribute("data-element") );
    currentSlide.style.display = "block";
    isPrevBtn(currentPage)
}

/**
 * @description toggles the pages by getting the next and toggles the active page
 *  enables prev if it is disabled currently and disables next if its the prev element
 * @returns {void}
 */
function getNext(){
    var currentPage = document.getElementsByClassName("page-item active")[0];
    currentPage.classList.toggle("active");
    // toggle the current slide to be unviewable
    var currentSlide = document.getElementById( currentPage.firstElementChild.getAttribute("data-element") );
    currentSlide.style.display = "none";
    isPrevBtn(currentPage)
    // toggles the current page (new page) to be viewable
    currentPage = currentPage.nextElementSibling;
    currentSlide = document.getElementById( currentPage.firstElementChild.getAttribute("data-element") );
    currentSlide.style.display = "block";
    currentPage.classList.toggle("active");
    isNextBtn(currentPage);
}

/**
 * @description Handles the event of a page being clicked and subsequently handles the rendering aspects of switching pages
 * @param {Event} event 
 * @returns {void}
 */
function pageClicked(event) {
    var currentPage = document.getElementsByClassName("page-item active")[0];
    var targetPage = event.target.parentElement;
    if (targetPage != currentPage){
        isPrevBtn(currentPage);
        isNextBtn(currentPage);
        isPrevBtn(targetPage);
        isNextBtn(targetPage);
        currentPage.classList.toggle('active');
        // get the current and next slides
        let cShown = document.getElementById(currentPage.firstElementChild.getAttribute("data-element"));
        let nextShown = document.getElementById(targetPage.firstElementChild.getAttribute("data-element"));
        // toggle the viewable slide
        cShown.style="display:none";
        nextShown.style.display="block";
        targetPage.classList.toggle('active');
    }
}

/**
 * @description sets the next btn to disabled if it is the next
 * @param {HTMLElement} currentPage
 * @returns {void}
 */
function isNextBtn(currentPage){
    if (currentPage.nextElementSibling.id == "next-btn"){
        currentPage.nextElementSibling.classList.toggle("disabled");
    }
}

/**
 * @description sets the prev btn to disabled if it is the prev
 * @param {HTMLElement} currentPage
 * @returns {void}
 */
function isPrevBtn(currentPage){
    if (currentPage.previousElementSibling.id == "prev-btn"){
        currentPage.previousElementSibling.classList.toggle("disabled");
    }
}
