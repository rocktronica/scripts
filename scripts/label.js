(function(exports, doc, body, undefined){

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
		this.el.setAttribute("style", "cursor: pointer; display: block; padding: 5px 10px; border-bottom: 1px solid #ccc; white-space: nowrap; position: relative;");
		this.el.innerHTML = this.model.href;
		this.el.addEventListener("click", this.onClick.bind(this));
		return this;
	};
	LinkView.prototype.update = function() {
		this.el.style["text-decoration"] = this.model.on ? "none" : "line-through";
	};
	LinkView.prototype.onClick = function() {
		this.model.toggle();
		this.update();
	};

	// Container / iFrame View

	var ContainerView = function(options) {
		this.el = doc.createElement("iframe");
		this.el.setAttribute("style", "border: 0; position: fixed; top: 0; right: 0; z-index: 100000;");
		body.appendChild(this.el); // or else contentDocument === null
		this.content = this.el.contentDocument.body;
		this.content.setAttribute("style", "background: #fff; font: 16px/22px sans-serif; padding: 20px; margin: 0; overflow: hidden; ");
		this.models = options.models;
	};
	ContainerView.prototype.render = function() {
		this.models.forEach(function(link) {
			var linkView = new LinkView({
				model: link
			});
			this.content.appendChild(linkView.render().el);
		}.bind(this));
		this.el.height = this.content.offsetHeight;
		this.el.width = this.content.offsetWidth;
		this.el.style.overflow = "hidden";
		return this;
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
			models: links
		});

		containerView.render();
	}());

}(this, document, document.body));