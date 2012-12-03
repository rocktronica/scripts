(function(doc, body, undefined){

	var objects = doc.querySelectorAll("embed, object, iframe");

	var biggest = (function(){
		var sofar, iCount = objects.length;
		for (var i=0; i<iCount; i++) {
			var object = objects[i]; sofar = sofar || object;
			if ((object.clientWidth * object.clientHeight || 0) > (sofar.clientWidth * sofar.clientHeight || 0)) {
				sofar = object;
			}
		}
		return sofar;
	}());

	if (biggest instanceof HTMLElement) {
		doc.head.innerHTML = '';
		doc.title = (function(){
			var sUrl = biggest.src || biggest.href || '';
			return sUrl.substr(sUrl.lastIndexOf('/')+1);
		}()) || document.title;
		biggest.setAttribute("style", "position:fixed; left:0; top:0; width:100%; height:100%;");
		body.innerHTML = biggest.outerHTML;
	} else {
		console.warn("Nothing found.");
	}

}(document, document.body));