(function(doc, body, undefined){

	// Link model

	var Link = function(options) {
		this.origin = options.origin;
		this.href = options.origin.href.replace(location.origin, "");
		this.on = true;
	};
	Link.prototype.toggle = function(on) {
		this.on = (on !== undefined) ? on : !this.on;
		this.origin.rel = this.on ? "stylesheet" : "";
		return this;
	}

	// Link View

	var LinkView = function(options) {
		this.el = doc.createElement("div");
		this.model = options.model;
	};
	LinkView.prototype.render = function() {
		this.el.className = "link";
		// emphasize basename
		this.el.innerHTML = this.model.href.replace(/([^\/]*)$/, "<strong>$1</strong>");
		this.el.addEventListener("click", this.onClick.bind(this));
		return this;
	};
	LinkView.prototype.update = function() {
		if (this.model.on) {
			this.el.classList.remove("inactive");
		} else {
			this.el.classList.add("inactive");
		}
	};
	LinkView.prototype.onClick = function() {
		this.model.toggle();
		this.update();
	};

	// Container / iFrame View

	var ContainerView = function(options) {

		this.el = doc.createElement("iframe");
		this.cssUrl = options.cssUrl;

		body.appendChild(this.el); // or else contentDocument === null
		this.setFrameContent();

		this.models = options.models;
		this.rendered = false;
	};
	// better name needed
	ContainerView.prototype.setFrameContent = function() {
		this.document = this.el.contentDocument;
		this.body = this.document.body;
		this.content = this.document.createElement("div");
		this.content.className = "content";
		this.body.appendChild(this.content);
	};
	ContainerView.prototype.render = function() {
		if (this.rendered) { return this; }
		this.makeStyle();
		this.update();
		this.rendered = true;
		return this;
	};
	ContainerView.prototype.makeStyle = function() {
		// inline style on iframe element
		this.el.setAttribute("style", "position: fixed; top: 10px; right: 10px; z-index: 100000; border: none;");
		// load in external css
		var link = this.el.contentDocument.createElement("link");
		link.rel = "stylesheet";
		link.href = this.cssUrl + (this.cssUrl.match(/\?/) ? "&" : "?" + +new Date());
		this.document.head.appendChild(link);
	};
	ContainerView.prototype.updateDimensions = function() {
		// this gives dom time to get dimensions
		// can it be avoided?
		setTimeout(function() {
			this.el.height = this.content.scrollHeight;
			this.el.width = this.content.scrollWidth;
		}.bind(this), 100);
	};
	ContainerView.prototype.update = function() {
		this.content.innerHTML = "";
		this.models.forEach(function(link) {
			var linkView = new LinkView({
				model: link
			});
			this.content.appendChild(linkView.render().el);
		}.bind(this));
		this.updateDimensions();
	};

	// Init

	(function() {
		var originalLinks = doc.querySelectorAll("link[rel='stylesheet']"),
			count = originalLinks.length,
			links = [];

		for (var i = 0; i < count; i++) {
			links.push(new Link({
				origin: originalLinks[i]
			}));
		}

		var containerView = new ContainerView({
			models: links,
			cssUrl: (function() {
				// get path via script url
				var scriptUrl = doc.querySelector("script[src*='toggleStyle']").src;
				return scriptPath = scriptUrl.substr(0, scriptUrl.lastIndexOf("/")) + "/toggleStyle.css";
			}())
		});

		containerView.render();
	}());

}(document, document.body));