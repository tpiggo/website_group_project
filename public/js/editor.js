function loadPreview() {
    markdown = document.getElementById("markdown").value;
    const method = "GET";
    var opts = { type: method, url: '/api/render-markdown', request: {markdown}};
    const aPromise = callBackEnd(opts);
    aPromise
        .then((response) => {
            document.getElementById("preview").innerHTML = response.response.html;
        })
        .catch(err => console.log(err));
}
