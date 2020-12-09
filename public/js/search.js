/**
 * @description Links the href in the button which is not a valid way to change pages and forces the href into the window,
 *              thus causing a page change.
 * @param {HTMLElement} element 
 */
function clickableBlock(element){
    if (element.getAttribute("href") != undefined){
        
        window.location = element.getAttribute("href");
    }
}