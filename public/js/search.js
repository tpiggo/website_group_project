function clickableBlock(element){
    if (element.getAttribute("href") != undefined){
        
        window.location = element.getAttribute("href");
    }
}