// for testing resp footer

$(".wrapper").has(".debug").remove();
$("#admin-menu").remove();

var onWinResize = function() { $(window).scrollTop(document.height - $(window).height()) };
window.addEventListener("resize", onWinResize);