(function(undefined) {
	var nav = document.querySelector("[data-element='nav']");
	nav.on("click", "header", function(event){
		event.preventDefault();
		chrome.tabs.executeScript(null, {
			file: this.dataset.filename
		});
	});

	var sections = document.querySelectorAll("section");
	location.hash = sections[0].id;

	var template = {
		nav: document.querySelector("[data-template='nav-item']").innerHTML
	};

	ajax("scripts.json", function() {
		var scripts = JSON.parse(this.response);
		var html = [];
		scripts.forEach(function(script) {
			script.filename = "scripts/" + script.filename;
			html.push(tmpl(template.nav, script));
		});
		nav.innerHTML += html.join("");
	});

	// Check for updates

	// Sort by most recently used

	// window.onerror
	// and override console into a  pre

}());