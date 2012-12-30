(function(undefined) {

	var Bookmarklet = Model.clone({
		execute: function() {
			chrome.tabs.executeScript(null, {
				file: this.filename
			});
		},
	});

	var bookmarklets = new Collection({
		fetch: function() {
			ajax({
				url: "scripts.json",
				callback: function(resp) {
					var scripts = JSON.parse(resp);
					this.reset();
					scripts.forEach(function(script) {
						script.filename = "scripts/" + script.filename;
						this.push(new Bookmarklet(script));
					}.bind(this));
				}.bind(this)
			});
			return this;
		}
	}).fetch();

	var bookmarkletsView = new View({
		el: document.querySelector("[data-element='bookmarklets']"),
		model: bookmarklets,
		template:
			document.querySelector("[data-template='nav-item']").innerHTML,
		init: function() {
			// could use some throttle here
			this.model.on("change", this.update, this);
			this.el.on("click", "header", this.clicked, this);
		},
		update: function() {
			var htmlItems = [];
			this.model.forEach(function(item) {
				htmlItems.push(tmpl(this.template, item));
			}.bind(this));
			this.html(htmlItems);
		},
		clicked: function(event) {
			this.model.getByKey("filename", event.target.dataset.filename).execute();
			event.preventDefault();
		}
	}).render();

	var app = new Model({});

	var appView = new View({
		el: "body",
		model: app,
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

	// Sort by most recently used

	// Check for updates

}());