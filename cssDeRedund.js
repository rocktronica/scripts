var body = document.querySelector("pre") || document.body,
	lines = body.innerText.split(/\n/),
	used = {},
	results = [];

lines.forEach(function (lineString, lineNumber) {
	var rule = (function (){
		var match = lineString.match(/.*{/);
		if (match) {
			return match[0].replace("{","").trim();
		}
		return false;
	}());
	if (rule) {
		if (used[rule]) {
			results.push(rule + " already defined on line " + used[rule] + ".");
		};
		used[rule] = lineNumber;
	}
});

body.innerHTML = results.join("\n");