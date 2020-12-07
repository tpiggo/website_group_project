function loadPreview() {
    markdown = document.getElementById("markdown").value;
    const method = "POST";
    var opts = { type: method, url: '/api/render-markdown', contentType: "JSON", request: {"markdown": markdown}};
    const aPromise = callBackEnd(opts);
    aPromise
        .then((response) => {
            document.getElementById("preview").innerHTML = response.response.html;
        })
        .catch(err => console.log(err));
}
