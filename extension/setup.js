// General Functions

var noop = function() {};

var ajax = function(options) {
	var req = new XMLHttpRequest();
	options.callback = options.callback || noop;
	options.method = (options.method || "GET").toUpperCase();
	req.open(options.method, chrome.extension.getURL(options.url), true);
	req.onload = function() {
		options.callback.bind(req)(req.response);
	};
	req.send();
};

var tmpl = function(s, d) { // via mir.aculo.us
	for(var p in d)
		s=s.replace(new RegExp('{{'+p+'}}','g'), d[p]);
	return s;
}

var extend = function() {
	return {}.extend(arguments);
};

Object.prototype.extend = function() {
	arguments.forEach(function(object) {
		if (typeof object === "object") {
			for (key in object) {
				if (object.hasOwnProperty(key)) {
					this[key] = object[key];
				}
			}
		}
	}.bind(this));
};

Object.prototype.forEach = function(funct) {
	for (key in this) {
		if (this.hasOwnProperty(key)) {
			funct.bind(this)(this[key]);
		}
	}
};

// DOM Manipulation

Object.prototype.toArray = function() {
	if (Array.isArray(this)) { return this; }
	return Array.prototype.slice.call(this);
};

Node.prototype.nodes = NodeList.prototype.nodes = function() {
	if (Array.isArray(this)) { return this; }
	return (this.length) ? this.toArray() : [this];
};

Node.prototype.filter = NodeList.prototype.filter = function(selector) {
	var outputNode;
	this.nodes().forEach(function(node) {
		if (node.webkitMatchesSelector(selector)) {
			outputNode = node;
		}
	});
	return outputNode;
};

Node.prototype.css = NodeList.prototype.css = function(rules) {
	this.nodes().forEach(function(node) {
		for (key in rules) {
			node.style[key] = rules[key];
		}
	});
	return this;
};

Node.prototype.addClass = NodeList.prototype.addClass = function(className) {
	this.nodes().forEach(function(node) {
		node.classList.add(className);
	});
	return this;
};

Node.prototype.removeClass = NodeList.prototype.removeClass = function(className) {
	this.nodes().forEach(function(node) {
		node.classList.remove(className);
	});
	return this;
};

Node.prototype.height = NodeList.prototype.height = function(setTo) {
	var node = this.nodes().slice(0,1)[0];
	if (setTo) {
		node.css("height", setTo);
	}
	return setTo || node.clientHeight;
};

Node.prototype.toggle = NodeList.prototype.toggle = function(show) {
	this.nodes().forEach(function(node) {
		// rename these variables
		var makeVisible = (show !== undefined) ?
			show : node.style.display === "hidden"
		node.style.display = makeVisible ?
			"block" : "none";
	});
	return this;
};

Node.prototype.show = NodeList.prototype.show = function() {
	this.nodes().forEach(function(node) {
		node.toggle(true);
	});
	return this;
};

Node.prototype.hide = NodeList.prototype.hide = function() {
	this.nodes().forEach(function(node) {
		node.toggle(false);
	});
	return this;
};

Node.prototype.on = NodeList.prototype.on =
	function(eventName, targetSelector, callback, context) {
	this.nodes().forEach(function(node) {
		node.addEventListener(eventName, function(event) {
			if (event.target) {
				var targets = [];
				if (typeof targetSelector === "function") {
					targets = [node];
					callback = targetSelector;
				} else {
					targets = node.querySelectorAll(targetSelector).toArray();
				}
				targets.forEach(function(target) {
					if (target === event.target || target.contains(event.target)) {
						callback.bind(context || target)(event);
						return;
					}
				});
			}
		});
	});
	return this;
};

// Models

var Model = (function() {
	var model = function(options) {
		this.extend({
			callbacks: {}
		}, options);
	};

	model.fn = model.prototype;

	model.fn.toString = model.fn.toJson = function() {
		return JSON.stringify(this);
	};

	model.fn.trigger = function(event) {
		if (this.callbacks[event]) {
			for (var i = 0; i < this.callbacks[event].length; i++) {
				var callback = this.callbacks[event][i];
				callback.action.apply(callback.context);
			}
		}
		return this;
	};

	model.fn.on = function(event, callback, that) {
		this.callbacks[event] = this.callbacks[event] || [];
		this.callbacks[event].push({
			action: callback,
			context: that || this
		});
		return this;
	};

	model.fn.set = function(key, value) {
		this[key] = value;
		this.trigger("set").trigger("set:" + key);
		return this;
	};

	model.fn.get = function(key) {
		this.trigger("get").trigger("get:" + key);
		return this[key];
	};

	// works, but not convinced not magic
	model.clone = function(options) {
		var model = function(options) {
			this.extend(options);
		};
		model.prototype = new Model(options);
		return model;
	};

	return model;
}());


// Collections

var Collection = (function() {
	var collection = function(options) {
		this.extend({
			items: []
		}, options);
	};

	collection.fn = collection.prototype = new Model();

	collection.fn.reset = function() {
		this.items.length = 0;
		this.trigger("reset").trigger("change");
	};

	collection.fn.push = function(item) {
		this.items.push(item);
		this.trigger("push").trigger("change");
		return this;
	};

	// or maybe .filter() with key, value, eq, limit, etc
	collection.fn.getByKey = function(key, value) {
		return this.items.filter(function(item) {
			return item.get(key) === value;
		})[0];
	};

	collection.fn.forEach = function(callback) {
		this.items.forEach(callback);
	};

	return collection;
}());

// Views

var View = (function() {
	var view = function(options) {
		this.tagName = options.tagName || "div";

		this.extend({
			events: {},
			el: document.createElement(this.tagName)
		}, options);

		if (typeof this.el === "string") {
			this.el = document.querySelector(this.el);
		}

		this.init();
	};

	view.fn = view.prototype;

	view.fn.init = view.fn.render = view.fn.update = function() {
		return this;
	};

	view.fn.html = function(html) {
		if (Array.isArray(html)) { html = html.join(""); }
		this.el.innerHTML = html;
		return this;
	};

	return view;
}());