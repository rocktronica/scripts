//javascript:
(function(){

	var $window = $(window),
		$body = $("body");

	// get experiments from DOM
	// put on global so this can be re-run w/o refresh
	if (!window.experiments) {
		var experiments = [];
		$("#experiment-form").find("li").each(function(i){
			var $li = $(this),
				$label = $li.find("label"),
				$select = $li.find("select");
			var experiment = {
				index: i,
				slug: $label.attr("for"),
				title: $label.text(),
				buckets: (function(){
					var a = [];
					$select.find("option:not(:first)").each(function(){
						a.push($(this).val());
					});
					return a;
				}())
			};
			experiments.push(experiment);
		});
		window.experiments = experiments;
	}
	console.log(experiments);

	// ask user to pick one
	var experiment = experiments[prompt((function(){
		var a = [];
		var iCount = experiments.length;
		for (var i = 0; i < iCount; i++) {
			var experiment = experiments[i];
			a.push(i + ": " + experiment.title);
		}
		return a.join('\n');
	}()), 0)];

	// clear head and body
	document.head.innerHTML = "";
	$body.empty().css("overflow", "hidden");

	// add some style
	$("<style>#testexpnav { position: fixed; top: 10px; left: 10px; z-index: 1000; } #testexpnav a { display: block; color: #000; text-decoration: none; } #testexpnav a.current { font-weight: bold; } iframe.current { z-index: 1; }</style>").appendTo($body);

    // add an iframe for each bucket
    (function(){
    	var $nav = $("<nav />", {
    		id: "testexpnav"
    	}).appendTo($body);
    	var iCount = experiment.buckets.length;
    	for (var i = 0; i < iCount; i++) {
    		(function(){
	    		var bucket = experiment.buckets[i];
			    var $iframe = $("<iframe>", {
			    	src: document.location.href
		    	}).css({
		    		position: "absolute",
		    		top: 0,
		    		left: 0,
		    		width: "100%",
		    		height: "100%",
		    		border: 0,
		    		"z-index:": 0
		    	});
	    		var onLoad = function(){
		    		var $form = $(this).contents().find("#experiment-form");
		    		var $option = $form.find("#" + experiment.slug).find("option[value='" + bucket + "']");
		    		$option.attr("selected", "selected");
		    		$form.submit();
		    		console.log(i + ": " + bucket + " loaded", $iframe, $option);
		    		$iframe.off("load", onLoad);
		    	};
		    	$iframe.appendTo($body).on("load", onLoad);
		    	var $link = $("<a />", {
		    		href: "#"
		    	}).html(bucket).bind("click", function(){
		    		$(this).addClass("current").siblings().removeClass("current");
		    		$iframe.addClass("current").siblings().removeClass("current");
		    		return false;
		    	}).appendTo($nav);
    		}());
    	}
    	$nav.find("a:first").trigger("click");
    }());

}());