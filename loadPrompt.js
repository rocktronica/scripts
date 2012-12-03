// IN TERMINAL RUN
// cd /Users/tommy/Documents/bookmarklets && python -m SimpleHTTPServer 8080

// AND THEN GET THE URL YOU WANT
// http://localhost:8080/justEmbed.js
// OR IF YOU'VE GOT HOSTS SETUP COOL
// http://bookmarklets:8080/

(function(){
	var script = document.createElement('script')
	script.src =  prompt("JavaScript URL", "cd /Users/tommy/Documents/bookmarklets && python -m SimpleHTTPServer 8080");
	document.body.appendChild(script);
}());

// POR EJEMPLO

javascript:(function(){
	var script = document.createElement("script");
	script.src =  "http://localhost:8080/shinkydink.js?" + (+new Date());
	document.body.appendChild(script);
}());