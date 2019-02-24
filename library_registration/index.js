var trs = document.querySelectorAll("tr[data-href]");
for (var i = 0; i < trs.length; i++) {
    (function() {
        var tr = trs[i];
        var href = tr.getAttribute("data-href");
        tr.addEventListener("click", function(ev) {
            window.location.href = href;
        });
    }());
}