(function() {
	var debounce;
	var css;
	var url = window.location.href;
	var shrinkydink = window.open(url);

	shrinkydink.addEventListener("load", function() {
		var img = shrinkydink.document.querySelector("img");

		img.addEventListender("load", function() {
			img.removeAttribute("style");
			img.removeAttribute("height");
			img.removeAttribute("width");
		});
	});

	var tellme = function() {
		clearTimeout(debounce);
		debounce = setTimeout(function() {
			css = "background: url(" + url + ") -" + shrinkydink.scrollX + "px " + " -" + shrinkydink.scrollY + "px no-repeat; " + "height: " + shrinkydink.innerHeight + "px; width: " + shrinkydink.innerWidth + "px; position: relative; display: block;";
			console.log(css);
		}, 100);
	}

	shrinkydink.addEventListener("scroll", tellme);
	shrinkydink.addEventListener("resize", tellme);
}());