var ajax = function(url, callback) {
	var req = new XMLHttpRequest();
	req.open("GET", chrome.extension.getURL(url), true)
	req.onload = callback; // how to pass arg?
	req.send(null);
};

Node.prototype.on = function(eventName, targetSelector, callback) {
	var parent = this;
	this.addEventListener(eventName, function(event) {
		if (event.target) {
			var targets = parent.querySelectorAll(targetSelector) || [],
				count = targets.length;
			for (var i = 0; i < count; i++) {
				var target = targets[i];
				if (target === event.target || target.contains(event.target)) {
					callback.bind(target)(event);
					return;
				}
			}
		}
	});
};

// http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
function tmpl(s,d){
	for(var p in d)
		s=s.replace(new RegExp('{{'+p+'}}','g'), d[p]);
	return s;
}
