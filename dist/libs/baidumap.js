"use strict";

System.register([], function (_export, _context) {
  "use strict";

  function MP(ak) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "http://api.map.baidu.com/api?v=2.0&ak=" + ak + "&callback=init";
      script.onerror = reject;
      document.head.appendChild(script);

      setTimeout(function () {
        var textIconOverlay = document.createElement("script");
        textIconOverlay.type = "text/javascript";
        textIconOverlay.src = "http://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js";
        document.head.appendChild(textIconOverlay);

        var markerClusterers = document.createElement("script");
        markerClusterers.type = "text/javascript";
        markerClusterers.src = "http://api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js";
        document.head.appendChild(markerClusterers);

        var heatmap = document.createElement("script");
        heatmap.type = "text/javascript";
        heatmap.src = "http://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js";
        document.head.appendChild(heatmap);

        resolve(BMap);
      }, 500);
    });
  }

  _export("MP", MP);

  return {
    setters: [],
    execute: function () {}
  };
});
//# sourceMappingURL=baidumap.js.map
