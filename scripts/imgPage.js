javascript:
(function(){
    var img = document.querySelector("img");
    if (!img) { return false; }
    ["style", "width", "height"].forEach(function(attr){ img.removeAttribute(attr); });
    location.href = "data:text/html,<style>body{min-height:" + img.clientHeight + "px;background:url(" + img.src + ") top center;}</style>";
}());