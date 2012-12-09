(function(doc, body, cache, undefined){

    var app = "splitframe";
    var needle = cache[app + "_needle"] =
        prompt("Development URL needle", cache[app + "_needle"] || "dev.");
    var replacement = cache[app + "_replacement"] =
        prompt("What replaces it on live site", cache[app + "_replacement"] || "www.");

    if (!needle || !replacement) { return false; }

    var url = location.href.replace(/#.*/, ""); // trim hash

    var frameset = doc.createElement("frameset");
    frameset.cols = "*,*";

    var localFrame = doc.createElement("frame");
    frameset.appendChild(localFrame);
    localFrame.src = url;

    var liveFrame = doc.createElement("frame");
    frameset.appendChild(liveFrame);

    doc.head.innerHTML = body.innerHTML = ""; // try to empty all content
    body.setAttribute("style", "margin:0;padding:0;"); // reset css
    body.appendChild(frameset);

    function stripUrl(url) {
        // removes protocol and trailing slashes
        return url.replace(/(^.*\/{2}|\/*$)/g, "");
    }

    localFrame.addEventListener("load", function(){
        var localUrl = this.contentDocument.location.href;
        document.title = this.contentDocument.title;
        liveFrame.src = localUrl.replace(needle, replacement);
        history.pushState(null, null,
            location.protocol + "//" + stripUrl(localUrl) + "/#!/" + stripUrl(liveFrame.src)
        );
    });

}(document, document.body, localStorage));