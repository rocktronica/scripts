(function(exports, undefined) {

	var Script = Model.subclass({
		init: function() {
			this.getFromLocal();
			return this;
		},
		execute: function() {
			chrome.tabs.executeScript(null, {
				file: this.filename
			});
			this.trigger("execute");
			return this;
		},
		getFromLocal: function() {
			storage.get(this.get("filename"), function(data) {
				if (data.lastRun) {
					this.set("lastRun", +new Date(data.lastRun));
				}
			}.bind(this));
			return this;
		},
		saveToLocal: function() {
			storage.save(this.get("filename"), this);
			return this;
		}
	});

	var scripts = exports.scripts = new Collection({
		model: Script,
		sortMethod: undefined,
		init: function() {
			storage.get("sortMethod", function(value) {
				this.set("sortMethod", value);
			}.bind(this));
			this.on("item:execute", function(item) {
				item.set("lastRun", +new Date())
					.saveToLocal();
				if (this.get("sortMethod") === "lastRun") {
					this.resort();
				}
			});
			this.on("set:sortMethod", function() {
				if (this.sortMethod) {
					storage.save("sortMethod", this.sortMethod);
					this.resort();
				}
			}, this);
			this.on("push", this.resort, this)
			this.on("item:set", this.resort, this)
		},
		resort: function() {
			this.sortBy(this.sortMethod);
		},
		fetch: function() {
			ajax({
				url: "scripts.json",
				callback: function(resp) {
					var scripts = JSON.parse(resp);
					this.reset();
					scripts.forEach(function(script) {
						script.filename = "scripts/" + script.filename;
						this.push(new this.model(script));
					}.bind(this));
				}.bind(this)
			});
			return this;
		},
		sortBy: function(which) {
			return this.sort(function(a,b) {
				if (which === "title") {
					return a.get("title").toUpperCase() > b.get("title").toUpperCase();
				} else if (which === "lastRun") {
					return a.get("lastRun", 0) < b.get("lastRun", 0);
				}
			});
		},
		console: function() {
			return this.forEach(function(item, i) {
				console.log(i, item.title, item.lastRun);
			});
		}
	}).fetch();

	var appView = new View({
		el: "body",
		// model: app,
		render: function() {
			this.sections = this.el.querySelectorAll("section[data-section]");
			this.navLinks = this.el.querySelectorAll("a[href^='#']");
			this.showSection(0);

			this.navLinks.on("click", function(event) {
				this.showSection(event.target.hash.substr(1));
			}.bind(this));
		},
		showSection: function(which) {
			this.sections.hide();
			var sectionEl = (typeof which === "number") ?
				this.sections[which] :
				sectionEl = this.sections.filter("section[id='" + which + "']");
			sectionEl.show();

			which = sectionEl.id;

			// Getting browser to recognize height sets container too
			sectionEl.height();

			this.navLinks.removeClass("active")
				.filter("a[href='#" + which + "']").addClass("active");
		}
	}).render();

	var scriptsView = new View({
		el: "[data-nav='scripts']",
		model: scripts,
		template:
			document.querySelector("[data-template='nav-item']").innerHTML,
		init: function() {
			this.model.on("change", this.update, this);
			this.el.on("click", "header", this.clicked, this);
		},
		update: function() {
			// could use some throttle here
			var htmlItems = [];
			this.model.forEach(function(item) {
				htmlItems.push(tmpl(this.template, item));
			}.bind(this));
			this.html(htmlItems);
		},
		clicked: function(event) {
			this.model.first({
				key: "filename",
				value: event.target.dataset.filename
			}).execute();
			event.preventDefault();
		}
	}).render();

	var settingsView = new View({
		el: "[data-section='settings']",
		sortBySelector: "select[data-select='sort by']",
		model: scripts,
		init: function() {
			this.el.on("change", this.sortBySelector, this.sorted, this);
		},
		render: function() {
			this.sortByEl = this.el.querySelector(this.sortBySelector);
			this.model.on("set:sortMethod", function() {
				this.sortByEl.value = this.model.get("sortMethod");
			}.bind(this));
		},
		sorted: function(event) {
			var value = event.target.value;
			if (value) {
				this.model.set("sortMethod", value);
			}
		}
	}).render();

	// Scripts list stored locally instead of file

	// Check for updates

}(this));