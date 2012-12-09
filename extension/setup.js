var getURL = chrome.extension.getURL;

var request = function(url, callback) {
	var req = new XMLHttpRequest();
	req.open("GET", getURL(url), true)
	req.onload = callback; // how to pass arg?
	req.send(null);
};

Node.prototype.listen = function(eventName, target, callback) {
	this.addEventListener(eventName, function(event) {
		if (event.target) {
			var targets = this.querySelectorAll(target) || [],
				count = targets.length;
			for (var i = 0; i < count; i++) {
				if (targets[i] === event.target) {
					callback.bind(event.target)(event);
					return;
				}
			}
		}
	}.bind(this));
};

// http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
function tmpl(s,d){
	for(var p in d)
		s=s.replace(new RegExp('{{'+p+'}}','g'), d[p]);
	return s;
}
