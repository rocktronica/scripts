// delete localStorage.oldHeader; delete localStorage.newHeader;
 // !!sHref.match('thumbtack.css') || 

//javascript:
(function(){

	var $link = $("link[rel='stylesheet'][href*='/theme/styles/build/']:first"), sHref = $link.attr("href");
	var $oldHeader = $("#header"), $newHeader = $(".header-wrapper");
	var bIsOld = !!$oldHeader.size();
	var sDefault = '<p>Run bookmarklet on another page...</p>';

	if (!$link.size() || (!$oldHeader.size() && !$newHeader.size())) {
		alert("Hmph!");
		return false;
	}

	if (bIsOld) {
		if (!window.newToggleRan) { localStorage.oldHeader = $oldHeader[0].outerHTML; }
		$link.attr("href", sHref.replace('thumbtack.css', 'new/core.css'));
		$oldHeader.replaceWith(localStorage.newHeader || sDefault);
	} else {
		if (!window.newToggleRan) { localStorage.newHeader = $newHeader[0].outerHTML; }
		$link.attr("href", sHref.replace('new/core.css', 'thumbtack.css'));
		$newHeader.replaceWith(localStorage.oldHeader || sDefault);
	}

	window.newToggleRan = true;

}());