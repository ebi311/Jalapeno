var Home = {};
Home.fixLayout = function () {
    var maxHeight = 0,
        lanes = $(".lane[id!=lane4]"),
        lane4 = $("#lane4");
    lanes.each(function () {
        var height = $(this).outerHeight();
        if ( maxHeight < height) {
            maxHeight = height;
        }
    });
    lanes.each(function () {
        var ps = $(this).find(".lotusSectionBody > p"),addDiff = 0,
            diff = maxHeight - $(this).outerHeight(),
            addHeight = Math.floor(diff / (ps.length * 2));
        addDiff = diff - (addHeight * ps.length * 2);
        ps.css({
            "padding-top": addHeight + "px",
            "padding-bottom": addHeight + "px"});
        ps.eq(ps.length - 1).css({
            "padding-bottom": (addHeight + addDiff) + "px"});
    });
    $("#lane4 > p").css("margin-top", maxHeight - lane4.outerHeight());
}
dojo.addOnLoad(Home.fixLayout);