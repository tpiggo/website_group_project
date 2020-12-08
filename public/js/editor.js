function loadPreview() {
    let markdown = document.getElementById("markdown").value;
    const method = "POST";
    var opts = { type: method, url: '/api/render-markdown', request: {"markdown": markdown} , contentType: 'JSON'};
    const aPromise = callBackEnd(opts);
    aPromise
        .then((response) => {
            if (response.status > 0){
                console.log("ERROR!", response.response);
            } else {
                document.getElementById("preview").innerHTML = response.data;
            }
        })
        .catch(err => console.log(err));
}
