(function(doc, body, undefined){

	var slices = doc.querySelectorAll(".slice"),
		count = slices.length;

	for (var i = 0; i < count; i++) {
		var slice = slices[i];
		slice.style.display = (slice.style.display === "none") ? "table-row" : "none";
	}

}(document, document.body));