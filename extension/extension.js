(function(undefined) {
	var nav = document.getElementById("nav");

	nav.listen("click", "a", function(event){
		event.preventDefault();
		chrome.tabs.executeScript(null, {file: this.pathname});
	});

	var template = {
		nav: document.getElementById("nav-item").innerHTML
	};

	request("scripts.json", function() {
		var scripts = JSON.parse(this.response);
		var html = [];
		scripts.forEach(function(script) {
			script.filename = getURL("scripts/" + script.filename);
			html.push(tmpl(template.nav, script));
		});
		nav.innerHTML += html.join("");
	});

}());