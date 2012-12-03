(function(win, doc, undefined){

	// uhh, errr, ahem!
	Node.prototype.css = function(rules) {
		for (key in rules) { this.style[key] = rules[key]; }
	};

	var Iframe = (function() {
		var iframe = function(options) {
			this.update(options);
		};
		iframe.fn = iframe.prototype;
		iframe.fn.update = function(options) {
			this.setUrl(options.url);
			this.onLoad = options.onLoad;
			return this;
		};
		iframe.fn.setUrl = function(url, reload) {
			if (!url) { return this; }
			url = url || this.url;
			reload = typeof reload === "boolean" ? reload : false;
			this.url = url;
			if (this.el && reload) {
				this.el.src = this.url;
			}
			return this;
		};
		iframe.fn.render = function(options) {
			if (this.el) { return this; }
			this.el = document.createElement("iframe");

			this.setUrl(options.url || this.url, true);
			this.el.css({
				margin: 0,
				padding: 0,
				position: "absolute",
				top: 0,
				width: "50%",
				height: "100%",
				border: 0,
				left: options.left ? 0 : "50%"
			});

			if (this.onLoad) {
		    	this.el.addEventListener("load", this.onLoad)
		    }

	    	return this;
		};
		return iframe;
	}());

	var Splitframe = (function() {
		var splitframe = function(options) {
			var savedSettings = JSON.parse(localStorage.splitframe || "{}");
			for (key in savedSettings) {
				options[key] = savedSettings[key];
			}
			this.update(options);
			this.saveSettings();
			this.init();
		};
		splitframe.fn = splitframe.prototype;
		splitframe.fn.update = function(options, update) {
			if (update === undefined) { update = true; }
			this.el = options.el;
			this.url = options.url || this.url;
			this.replaceNeedle = options.replaceNeedle || this.replaceNeedle;
			this.replaceWith = options.replaceWith || this.replaceWith;
			if (update) { this.saveSettings(); }
		};
		splitframe.fn.makeLiveUrl = function(url) {
			url = url || this.url;
			if (this.replaceNeedle && this.replaceWith) {
				return url.replace(this.replaceNeedle, this.replaceWith);
			}
			return url;
		};
		splitframe.fn.init = function() {
			this.localFrame = new Iframe({
				url: this.url,
				onLoad: function() {
					this.url = this.localFrame.el.contentDocument.location.href;
					this.localFrame.setUrl(this.url);
					history.pushState(null, null, this.url);
					this.liveFrame.setUrl(this.makeLiveUrl(this.url), true);
				}.bind(this)
			});
			this.liveFrame = new Iframe({
				url: this.makeLiveUrl()
			});
		};
		splitframe.fn.render = function() {
			// clear out body
			this.el.innerHTML = "";
			this.el.css({
				position: "fixed",
				padding: 0,
				margin: 0,
				top: 0,
				left: 0,
				height: "100%",
				width: "100%"
			});
			this.el.appendChild(this.localFrame.render({
				left: true
			}).el);
			this.el.appendChild(this.liveFrame.render({
				right: true
			}).el);
		};
		splitframe.fn.saveSettings = function() {
			var settings = {};
			for (key in this) {
				var value = this[key];
				if (this.hasOwnProperty(key) && value && typeof value !== "object") {
					settings[key] = this[key];
				}
			}
			win.localStorage.splitframe = JSON.stringify(settings);
		};
		splitframe.fn.reset = function() {
			delete win.localStorage.splitframe;
			this = new splitframe(); // eh?
		};
		return splitframe;
	}());

	var splitframe = new Splitframe({
		el: document.body,
		url: win.location.href
	});
	splitframe.render();

}(window, document));