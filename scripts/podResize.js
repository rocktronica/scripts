(function(){
    var $doc = $(document);
    $(".pod").each(function() {
        var $pod = $(this);
        var $handle = $("<div class='handle'></div>").appendTo($pod);

        var pos = {
                start: {},
                diff: {}
            },
            css = {
                start: {
                    width: $pod.width()
                },
                end: {
                    width: undefined
                }
            };

        var throttle;
        var fn = {
            startDrag: function(e) {
                pos.start = {
                    x: e.clientX || e.pageX
                };
                $doc.on("mousemove", fn.onMouseMove);
                $doc.on("mouseup", fn.endDrag);
                $doc.on("keypress", fn.endDrag);
                return false;
            },
            onMouseMove: function(e) {
                throttle = throttle || setTimeout(function(){
                    pos.diff.x = pos.start.x - (e.clientX || e.pageX);
                    css.end.width = css.start.width - pos.diff.x;
                    $pod.width(css.end.width);
                    throttle = undefined;
                }, 1);
            },
            endDrag: function(e) {
                pos.diff = {
                    x: 0
                };
                css = {
                    start: {
                        width: $pod.width()
                    }, end: {
                        width: undefined
                    }
                };
                $doc.off("mousemove", fn.onMouseMove);
                $doc.off("mouseup", fn.endDrag);
                $doc.off("keypress", fn.endDrag);
                return false;
            }
        };

        $handle.on("mousedown", fn.startDrag);

    });

}());