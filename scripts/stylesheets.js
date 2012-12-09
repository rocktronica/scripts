var stylesheets = document.querySelectorAll("link[rel='stylesheet']");

for (var i=0; i<stylesheets.length; i++) {
	var stylesheet = stylesheets[i];
	console.log(stylesheet.href);
}