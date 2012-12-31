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

// Augmenting natives

Array.prototype.first = function() {
	return this[0];
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
	return this;
};

Object.prototype.clone = function() {
	var clone = {};
	for (key in this) {
		clone[key] = this[key];
	}
	return clone;
};

Object.prototype.toSimpleJson = function() {
	var clone = this.clone();
	for (key in clone) {
		if (!(typeof clone[key]).match(/(string|number)/)) {
			delete clone[key];
		}
	}
	return JSON.stringify(clone);
};

Object.prototype.forEach = function(funct) {
	for (key in this) {
		if (this.hasOwnProperty(key)) {
			funct.bind(this)(this[key]);
		}
	}
	return this;
};

Object.prototype.toArray = function() {
	if (Array.isArray(this)) { return this; }
	return Array.prototype.slice.call(this);
};

// Augmenting DOM nodes

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
		if (this.init) { this.init(); }
	};

	model.fn = model.prototype;

	model.fn.toString = model.fn.toJson = function() {
		return this.toSimpleJson();
	};

	model.fn.trigger = function(event, item) {
		if (this.callbacks[event]) {
			for (var i = 0; i < this.callbacks[event].length; i++) {
				var callback = this.callbacks[event][i];
				callback.action.call(callback.context, item);
			}
		}
		if (this.parent) {
			this.parent.trigger("item:" + event, this);
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

	model.fn.get = function(key, fallback) {
		this.trigger("get").trigger("get:" + key);
		return this[key] || fallback;
	};

	// model.fn.destroy = function() {};

	// work in progress....
	model.subclass = function(subclassOptions) {
		var Subclass = function(instanceOptions) {
			this.extend(subclassOptions, instanceOptions);
			model.apply(this);
		};
		Subclass.prototype = model.prototype;
		return function(instanceOptions) {
			var subclass = new Subclass(instanceOptions);
			// idky this isn't firing from Subclass...
			if (subclass.init) { subclass.init(); }
			return subclass;
		};
	};

	return model;
}());


// Collections

var Collection = (function() {
	var collection = function(options) {
		this.extend({
			items: []
		}, options);
		// idky this won't bubble up from Model
		if (this.init) { this.init(); }
	};

	collection.fn = collection.prototype = new Model;

	collection.fn.reset = function() {
		this.items.length = 0;
		this.trigger("reset").trigger("change");
	};

	collection.fn.push = function(item) {
		item.parent = this;
		this.items.push(item);
		this.trigger("push").trigger("change");
		return this;
	};

	collection.fn.filter = function(options) {
		var results = this.items,
			options = options || {};
		if (options.key && options.value) {
			results = this.items.filter(function(item) {
				return item.get(options.key) === options.value;
			});
		} else if (options.eq) {
			results = [this.items[options.eq]];
		}
		if (options.limit) {
			results = results.slice(0, options.limit);
		}
		return results;
	};

	collection.fn.eq = function(eq) {
		return this.items[eq];
	};

	collection.fn.first = function(options) {
		return this.filter(options)[0];
	}

	collection.fn.forEach = function(options) {
		this.items.forEach(options);
		return this;
	};

	collection.fn.sort = function(options) {
		this.items.sort(options);
		this.trigger("sort").trigger("change");
		return this;
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

// Chrome extension misc

var storage = {
	save: function(key, value, callback) {
		var data = {};
		data[key] = value;
		chrome.storage.sync.set(data, callback || noop);
	},
	get: function(key, callback) {
		chrome.storage.sync.get(key, function(items) {
			(callback || noop)(items[key]);
		});
	}
};