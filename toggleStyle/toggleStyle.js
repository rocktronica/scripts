(function(doc, body, undefined){

	// Style model
	var Style = function(options) {
		this.origin = options.origin;
		this.href = options.origin.href.replace(location.origin, "");
		this.on = true;
	};
	Style.prototype.toggle = function(on) {
		this.on = (on !== undefined) ? on : !this.on;
		this.origin.rel = this.on ? "stylesheet" : "";
		return this;
	}

	// Style View

	var StyleView = function(options) {
		this.el = doc.createElement("div");
		this.model = options.model;
	};
	StyleView.prototype.render = function() {
		this.el.className = "link";
		// emphasize basename
		this.el.innerHTML = this.model.href.replace(/([^\/]*)$/, "<strong>$1</strong>");
		this.el.addEventListener("click", this.onClick.bind(this));
		return this;
	};
	StyleView.prototype.update = function() {
		if (this.model.on) {
			this.el.classList.remove("inactive");
		} else {
			this.el.classList.add("inactive");
		}
	};
	StyleView.prototype.onClick = function() {
		this.model.toggle();
		this.update();
	};

	// Container / iFrame View

	var ContainerView = function(options) {
		this.el = doc.createElement("iframe");
		this.cssUrl = options.cssUrl;
		this.models = options.models;
	};
	ContainerView.prototype.render = function() {
		this.content = doc.createElement("div"); // this.document
		this.content.className = "content";
		this.el.addEventListener("load", this.onFrameLoad.bind(this));

		this.el.setAttribute("style",
			"position: fixed; top: 10px; right: 10px; z-index: 100000; border: none;"
		);

		this.update();
		return this;
	};
	ContainerView.prototype.onFrameLoad = function() {
		this.document = this.el.contentDocument;
		this.body = this.document.body;
		this.body.appendChild(this.content);

		// load in external css
		var link = this.el.contentDocument.createElement("link");
		link.rel = "stylesheet";
		link.href = this.cssUrl + (this.cssUrl.match(/\?/) ? "&" : "?" + +new Date());
		this.document.head.appendChild(link);
	};
	ContainerView.prototype.updateDimensions = function() {
		// gives dom time to get dimensions
		setTimeout(function() {
			this.el.height = this.content.scrollHeight;
			this.el.width = this.content.scrollWidth;
		}.bind(this), 100);
	};
	ContainerView.prototype.update = function() {
		this.content.innerHTML = "";
		this.models.forEach(function(link) {
			var styleView = new StyleView({
				model: link
			});
			this.content.appendChild(styleView.render().el);
		}.bind(this));
		this.updateDimensions();
	};

	// Init

	(function() {
		var Styles = (function() {
			var originalLinks = doc.querySelectorAll("link[rel='stylesheet']"),
				count = originalLinks.length,
				links = [];
			for (var i = 0; i < count; i++) {
				links.push(new Style({
					origin: originalLinks[i]
				}));
			}
			return links;
		}.bind(this)());

		var inlinedStyles = document.querySelectorAll("style");


		var containerView = new ContainerView({
			models: Styles,
			cssUrl: (function() {
				// get path via script url
				var scriptUrl = doc.querySelector("script[src*='toggleStyle']").src;
				return scriptPath = scriptUrl.substr(0, scriptUrl.lastIndexOf("/")) + "/toggleStyle.css";
			}())
		});

		body.appendChild(containerView.render().el);
	}());

}(document, document.body));