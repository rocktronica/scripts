(function(){
	var scripts = document.querySelectorAll("script[src*='style-guide.js']");

	var ajax = function(url, callback) {
		var req = new XMLHttpRequest();
		req.open("GET", url, true)
		req.onload = callback; // how to pass arg?
		req.send(null);
	};

	var getSelector = function(line) {
		var match = line.match(/\$\(['"][^'"]*['"]\)/);
		if (match && match.length) {
			return match[0];
		}
		return undefined;
	};

	for (var i = 0; i < scripts.length; i++) {
		var script = scripts[i],
			selectors = [];
		ajax(script.src, function() {
			var resp = this.response,
				lines = resp.split(/\n/),
				count = lines.length;
			for (var ii = 0; ii < count; ii++) {
				var line = lines[ii];
				var selector = getSelector(line);
				if (selector) {
					selectors.push({
						selector: selector,
						text: line,
						index: ii
					});
				}
			}
			console.log(selectors);
		});
	}


}());