(function(document, body, undefined) {

	var KEY = {
		ESC: 27
	};

	var Drag = (function() {
		var drag = function(options) {
			options = options || {};
			this.width = this.height = 0;
			this.update({
				start: options.start
			});
		};

		drag.fn = drag.prototype;

		drag.fn.hasDimensions = function() {
			return this.topLeft && this.bottomRight &&
				this.start.x && (this.current.x || this.end.x);
		};

		drag.fn.update = function(options) {
			if (options.start) {
				this.start = options.start;
			}
			if (options.current) {
				this.current = options.current;
			}
			if (options.end) {
				this.end = options.end;
			}
			var start = this.start || { x: undefined, y: undefined };
			var end = this.current || this.end || { x: undefined, y: undefined };
			this.change = {
				x: end.x - start.x,
				y: end.y - start.y
			};
			this.width = Math.abs(this.change.x);
			this.height = Math.abs(this.change.y);
			if (this.width && this.height) {
				this.topLeft = {
					x: this.change.x > 0 ? start.x : end.x,
					y: this.change.y > 0 ? start.y : end.y
				};
				this.bottomRight = {
					x: this.change.x > 0 ? end.x : start.x,
					y: this.change.y > 0 ? end.y : start.y
				};
			}
		}; // drag.fn.update

		return drag;

	}()); // Drag

	var Sprite = (function() {
		var sprite = function(options) {
			this.update(options);
			this.callbacks = {};
		};
		sprite.fn = sprite.prototype;
		sprite.fn.update = function(options) {
			if (options.top) { this.top = options.top; }
			if (options.left) { this.left = options.left; }
			if (options.width) { this.width = options.width; }
			if (options.height) { this.height = options.height; }
			if (options.url) { this.url = options.url; }
		};
		sprite.fn.trigger = function(event, that) {
			if (this.callbacks[event]) {
				for (var i = 0; i < this.callbacks[event].length; i++) {
					var callback = this.callbacks[event][i];
					callback.action.apply(callback.context);
				}
			}
		};
		sprite.fn.on = function(event, callback, that) {
			this.callbacks[event] = this.callbacks[event] || [];
			this.callbacks[event].push({
				action: callback,
				context: that || this
			});
		};
		sprite.fn.set = function(key, value) {
			this[key] = value;
			this.trigger("change:" + key);
			this.trigger("change");
		};
		sprite.fn.toString = sprite.fn.toCss = function() {
			var lines = [];
			if (this.url) {
				lines.push("background-image: url(\"" + this.url + "\");");
			}
			if (this.top && this.left) {
				lines.push("background-position: " + (this.left * -1) + "px " +
					(this.top * -1) + "px;");
			}
			if (this.height && this.width) {
				lines.push("height: " + this.height + "px;");
				lines.push("width: " + this.width + "px;");
			}
			return lines.join("\n");
		};
		return sprite;
	}());
	var sprite = new Sprite({
		url: document.querySelector("img").src // temp
	});

	var spriteView = (function() {
		var SpriteView = function() {
			this.model = sprite;
			this.el = document.createElement("div");
			body.appendChild(this.el);
			this.init();
		};

		SpriteView.prototype.init = function() {
			var mover, resizer, offset = { x: 0, y: 0 };
			var view = this;

			this.el.addEventListener("mousedown", function(e) {
				e.preventDefault();
				e.stopPropagation();
				offset = {
					x: e.offsetX,
					y: e.offsetY
				};
				var direction = view.getCorner(e.offsetX, e.offsetY);
				if (direction) {
					resizer = new Drag({
						start: {
							x: e.pageX,
							y: e.pageY
						}
					});
					resizer.origin = { // temp!
						left: view.model.left,
						top: view.model.top,
						width: view.model.width,
						height: view.model.height
					};
					resizer.direction = direction; // meh
					body.addEventListener("mousemove", updateResizer);
				} else {
					mover = new Drag({
						start: {
							x: e.pageX - offset.x,
							y: e.pageY - offset.y
						}
					});
					body.addEventListener("mousemove", updateMover);
				}
				body.addEventListener("mouseup", mouseUp);
			});

			this.el.addEventListener("mousemove", function(e) {
				view.setCursor(e.offsetX, e.offsetY);
			});

			var updateMover = function(e) {
				if (mover) {
					mover.update({
						current: {
							x: e.pageX - offset.x,
							y: e.pageY - offset.y
						}
					});
					view.moveViaDrag(mover);
				}
			};

			var updateResizer = function(e) {
				if (resizer) {
					resizer.update({
						current: {
							x: e.pageX,
							y: e.pageY
						}
					})
					view.resizeViaDrag(resizer);
				}
			};

			var mouseUp = function(e) {
				e.preventDefault();
				e.stopPropagation();
				if (mover) {
					mover.update({
						end: {
							x: e.pageX - offset.x,
							y: e.pageY - offset.y
						}
					});
					view.moveViaDrag(mover);
					mover = undefined;
				} else if (resizer) {
					resizer.update({
						end: {
							x: e.pageX,
							y: e.pageY
						}
					});
					resizer.origin = undefined;
					view.resizeViaDrag(resizer);
					resizer = undefined;
				}
				body.removeEventListener("mousemove", updateMover);
				body.removeEventListener("mousemove", updateResizer);
				body.removeEventListener("mouseup", mouseUp);
			};

			// bind to model's triggers
			this.model.on("change:left", function() { this.el.style.left = this.model.left; }, this);
			this.model.on("change:top", function() { this.el.style.top = this.model.top; }, this);
			this.model.on("change:width", function() { this.el.style.width = this.model.width; }, this);
			this.model.on("change:height", function() { this.el.style.height = this.model.height; }, this);

		}; // SpriteView.prototype.init


		SpriteView.prototype.setCursor = function(x,y,threshold) {
			var corner = this.getCorner(x,y,threshold);
			var cursor = corner;
			if (corner) {
				if (corner.match("n|s")) {
					cursor = "ns";
				}
				if (corner.match("w|e")) {
					cursor = "ew";
				}
				if (corner.match("nw|se")) {
					cursor = "nwse";
				}
				if (corner.match("ne|sw")) {
					cursor = "nesw";
				}
				cursor += "-resize";
			}
			this.el.style.cursor = cursor || "move";
		};

		SpriteView.prototype.getCorner = function(x,y,threshold) {
			threshold = Math.round(
				threshold || Math.min(20, this.model.height / 3, this.model.width / 3)
			);
			var side = {
				top: y <= threshold,
				right: x >= this.model.width - threshold,
				bottom: y >= this.model.height - threshold,
				left: x <= threshold
			};
			if (side.top && side.left) {
				return "nw";
			} else if (side.top && side.right) {
				return "ne";
			} else if (side.bottom && side.left) {
				return "sw";
			} else if (side.bottom && side.right) {
				return "se";
			} else if (side.top) {
				return "n";
			} else if (side.right) {
				return "e";
			} else if (side.bottom) {
				return "s";
			} else if (side.left) {
				return "w";
			}
			return undefined;
		};

		SpriteView.prototype.moveViaDrag = function(drag) {
			if (!drag || !drag.hasDimensions()) { return false; }
			var left = (drag.start.x > drag.current.x) ? drag.topLeft.x : drag.bottomRight.x;
			var top = (drag.start.y > drag.current.y) ? drag.topLeft.y : drag.bottomRight.y;
			this.model.set("left", left);
			this.model.set("top", top);
		};

		SpriteView.prototype.renderViaDrag = function(drag) {
			if (!drag || !drag.hasDimensions()) { return false; }
			this.model.set("width", drag.width);
			this.model.set("height", drag.height);
			this.model.set("left", drag.topLeft.x);
			this.model.set("top", drag.topLeft.y);
		};

		SpriteView.prototype.resizeViaDrag = function(drag) {
			if (!drag || !drag.hasDimensions() || !drag.origin) { return false; }
			if (drag.direction.match("n")) {
				var top = drag.origin.top + drag.change.y;
				this.model.set("top", top);
			}
			if (drag.direction.match("w")) {
				var left = drag.origin.left + drag.change.x;
				this.model.set("left", left);
			}
			if (drag.direction.match("n|s")) {
				var height = drag.origin.height + drag.change.y;
				if (drag.direction.match("n")) { height = drag.origin.height - drag.change.y; }
				this.model.set("height", height);
			}
			if (drag.direction.match("w|e")) {
				var width = drag.origin.width + drag.change.x;
				if (drag.direction.match("w")) { width = drag.origin.width - drag.change.x; }
				this.model.set("width", width);
			}
		};

		return new SpriteView();
	}());

	var outputView = (function() {
		var OutputView = function() {
			this.model = sprite;
			this.el = (function(){
				var pre = document.createElement("pre");
				pre.setAttribute("style", "position: fixed; bottom: 10px; right: 10px; z-index: 200; font: 14px/20px monospace; padding: 20px; color: white; background: rgba(0,0,0,.8);");
				pre.setAttribute("contenteditable", "contenteditable");
				body.appendChild(pre);
				return pre;
			}());
			this.init();
		};
		OutputView.prototype.init = function() {
			this.model.on("change", this.update, this);
			this.update();
		};
		OutputView.prototype.update = function() {
			this.el.innerHTML = this.model.toCss();
			// make sure you can scroll to all parts of image
			body.style.padding = "0 0 " + this.el.clientHeight + "px";
		};
		return new OutputView();
	}());

	var appView = (function() {
		var AppView = function() {
			this.el = body;
			this.img = document.querySelector("img");
			this.spriteView = spriteView;
			this.init();
		};
		AppView.prototype.init = function() {
			var view = this;
			(function(){
				var style = document.createElement("style");
				body.appendChild(style);
				var expand = Math.max(document.body.clientWidth, document.body.clientHeight);
				style.innerHTML = "div { position: absolute; z-index: 100; box-shadow: 0 0 0 1px rgba(255,255,255,.5), 0 0 0 " + expand + "px rgba(0,0,0,.1); outline: 2px dashed rgba(0,0,0,.2); cursor: move; }";
			}());
			(function(){
				var drag;
				var mouseMove = function(e) {
					drag.update({
						current: {
							x: e.pageX,
							y: e.pageY
						}
					});
					view.spriteView.renderViaDrag(drag);
				};
				view.img.addEventListener("mousedown", function(e) {
					e.preventDefault();
					drag = new Drag({
						start: {
							x: e.pageX,
							y: e.pageY
						}
					});
					view.el.addEventListener("mousemove", mouseMove);
				});
				view.el.addEventListener("mouseup", function(e) {
					e.preventDefault();
					if (drag instanceof Drag) {
						drag.update({
							end: {
								x: e.pageX,
								y: e.pageY
							}
						});
						view.spriteView.renderViaDrag(drag);
						view.el.removeEventListener("mousemove", mouseMove);
						drag = undefined;
					}
				});
			}());
			(function(){
				// only bind this when it's needed!
				view.el.addEventListener("keydown", function(e) {
					if (e.which === KEY.ESC) {
						if (resizer) {
							console.log("Cancel resizer");
						} else if (mover) {
							console.log("Cancel ender");
						}
					}
				});
			}());
		}
		return new AppView();
	}());

}(document, document.body));