// dependencies: d3, leaflet, jquery

function hubChart() {
  // initialize config with defaults
  var config = {
    tileLayer: '',
    attribution: '',
    mapCenter: [-37.8124, 144.9661], // Melbourne, Australia
    mapZoom: 12,
    hubData: function(d) {return d.level1; },
    hubLat: function(d) {return 180 * (d.y - 1) / 14 - 90; },
    hubLng: function(d) {return 360 * (d.x - 1) / 14 - 180; },
    hubRadius: 5.0,
    hubColor: 'black',
    armData: function(d) {return d.level2; },
    armAngle: function(d) {return 360 * (d.x - 1) / 14; },
    armWidth: 1.0,
    armLength1: 10.0,
    armLength2: 20.0,
    armColor1: 'white',
    armColor2: 'black',
    maxMapWidth: function() {return window.innerWidth}, // Maximum map dimensions. Used for calculating SVG bounds. May result in clipping if exceeded.
    maxMapHeight: function() {return window.innerHeight} // Maximum map dimensions. Used for calculating SVG bounds. May result in clipping if exceeded.
  }

  // Utility function to evaluate value of an attribute bound to d3 data
  function extractVal(val, thisObj, d, i) {
    if (typeof(val) === "function") {
      return val.call(thisObj, d, i);
    }
    // val is a constant
    return val;
  }

  // function to initialise the map (if necessary) and add overlayPane
  function getMap(rootElm, pinPoint) {
    var map = jQuery.data(rootElm, "mapObj");
    var svg = jQuery.data(rootElm, "svgObj");
    var g = jQuery.data(rootElm, "gObj");

    if (!map) {
      map = new L.Map(rootElm, {center: config.mapCenter, zoom: config.mapZoom});
      map.addLayer(new L.TileLayer(config.tileLayer, {attribution: config.attribution}));
      // Use JQuery to attach the map object to the DOM so that we can easily get the map object later
      jQuery.data(rootElm, "mapObj", map);

      var svg = d3.select(map.getPanes().overlayPane).append("svg");
      svg.style("position", "relative");
      jQuery.data(rootElm, "svgObj", svg);
      g = svg.append("g");
      jQuery.data(rootElm, "gObj", g);

      //topLeft = [0,0];
      //bottomRight = [extractVal(config.maxMapWidth, rootElm, null, 0), extractVal(config.maxMapHeight, rootElm, null, 0)];

      var onMove = function () {
        //console.log(hub)
        
        //var bounds = boundsPoints(hub);
        //bounds = padBounds(bounds, config.padding);
        //var topLeft = bounds[0], bottomRight = bounds[1];

        // https://stackoverflow.com/questions/32734897/how-to-get-map-box-coordinates-from-marker-in-leaflet
        // https://leafletjs.com/reference-1.5.0.html
        var mapBounds = map.getPixelBounds();
        console.log(map.getPixelBounds());
        //console.log(map.getPixelWorldBounds());
        console.log(map.getBounds());
        console.log(map.getCenter());
        console.log(map.getSize());
        // var topLeft = [mapBounds.min.x, mapBounds.min.y];
        // var bottomRight = [mapBounds.max.x, mapBounds.max.y];
        // console.log(topLeft);
        // console.log(bottomRight);

        // Workaround because getPixelBounds() was returning very large numbers.
        // TODO: Take into account bounds the include antimeridian (i.e. wrap around) 
        //p1 = map.latLngToLayerPoint(map.getBounds().getNorthWest());
        //p2 = map.latLngToLayerPoint(map.getBounds().getSouthEast());
        //var topLeft = [p1.x, p1.y];
        //var bottomRight = [p2.x, p2.y];
        p = map.getPanes().overlayPane; // global
        console.log(p)
        b = p.getBoundingClientRect()
        console.log(b)
        var topLeft = [-b.left, -b.top];
        var bottomRight = [topLeft[0] + window.innerWidth, topLeft[1] + window.innerHeight];
        console.log(topLeft)
        console.log(bottomRight)
        //console.log(p1);
        //console.log(p2);
        
        svg.attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
      }

      var onViewReset = function () {
        //console.log(hub)
        
        //var bounds = boundsPoints(hub);
        //bounds = padBounds(bounds, config.padding);
        //var topLeft = bounds[0], bottomRight = bounds[1];

        // https://stackoverflow.com/questions/32734897/how-to-get-map-box-coordinates-from-marker-in-leaflet
        // https://leafletjs.com/reference-1.5.0.html
        var mapBounds = map.getPixelBounds();
        console.log(map.getPixelBounds());
        //console.log(map.getPixelWorldBounds());
        console.log(map.getBounds());
        console.log(map.getCenter());
        console.log(map.getSize());
        // var topLeft = [mapBounds.min.x, mapBounds.min.y];
        // var bottomRight = [mapBounds.max.x, mapBounds.max.y];
        // console.log(topLeft);
        // console.log(bottomRight);

        // Workaround because getPixelBounds() was returning very large numbers.
        // TODO: Take into account bounds the include antimeridian (i.e. wrap around) 
        //p1 = map.latLngToLayerPoint(map.getBounds().getNorthWest());
        //p2 = map.latLngToLayerPoint(map.getBounds().getSouthEast());
        //var topLeft = [p1.x, p1.y];
        //var bottomRight = [p2.x, p2.y];
        p = map.getPanes().overlayPane; // global
        console.log(p)
        b = p.getBoundingClientRect()
        console.log(b)
        var topLeft = [-b.left, -b.top];
        var bottomRight = [topLeft[0] + window.innerWidth, topLeft[1] + window.innerHeight];
        console.log(topLeft)
        console.log(bottomRight)
        //console.log(p1);
        //console.log(p2);
        
        svg.attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        g.attr("class", "overlay leaflet-zoom-hide");

        // svg.attr("width", extractVal(config.maxMapWidth, rootElm, null, 0))
        //    .attr("height", extractVal(config.maxMapHeight, rootElm, null, 0))
        //    .style("left", "0px")
        //    .style("top", "0px");
        svg.selectAll(".hubg").attr("transform", pinPoint);
      }

      map.on("move", function() {
        onMove();
      });

      map.on("viewreset", function() {
        onViewReset()
        //hub.attr("transform", pinPoint);
      });
      onViewReset()
    }

    //g.append("g").attr("class", "overlay leaflet-zoom-hide");

    return map;
  }

  // function to generate / update chart
  function chart(selection) {

    // setup map once for each element in selection
    selection.each(function(data) {
      var rootElm = this;

      var map = getMap(rootElm, pinPoint);
      //var svg = selection.select("svg");
      //var g = selection.select(".overlay");

      var hub = selection.select(".overlay").selectAll(".hubg")
      .data(config.hubData); // extract hubData from network (using function specified in config)
      var hubg = hub.join("g")
        .attr("class", "hubg")
        .attr("transform", pinPoint);
      //hub.exit().remove();

      var hubLayer1 = hubg.append("g");
      var hubLayer2 = hubg.append("g"); // appears on top of layer 1

      hubLayer2.append("circle")
      .attr("class", "hub")
      .style("stroke", "none")
      .style("fill", config.hubColor)
      .attr("r", config.hubRadius);

      var arm = hubLayer1.selectAll(".arm")
      .data(function (hubData, i) {
        // We need access to attributes in the outer hubData in addition to the inner armData.
        //
        // Specifically, we need access to the radius from within the arms.
        // Thus we create a custom data object that wraps an armObj alongside with the radius.
        var r = extractVal(config.hubRadius, this, hubData, i);
        var armData = extractVal(config.armData, this, hubData, i);
        return armData.map(function(armObj) {return {armObj: armObj, r: r}; });
      });
      var armg = arm.join("g")
      .attr("class", function(d, i) {console.log("add arm"); return "arm"; });

      armg.append("line")
      .attr("stroke", function(d, i) {return extractVal(config.armColor2, this, d.armObj, i); })
      .attr("stroke-width", function(d, i) {return extractVal(config.armWidth, this, d.armObj, i); })
      .attr("stroke-linecap", "butt") // it's important the the stroke doesn't make the line any longer than it should be.
      .attr("x1", 0)
      .attr("y1", function(d, i) {return d.r + extractVal(config.armLength1, this, d.armObj, i); })
      .attr("x2", 0)
      .attr("y2", function(d, i) {return d.r + extractVal(config.armLength2, this, d.armObj, i); })
      .attr("transform", function(d, i) {return "rotate(" + extractVal(config.armAngle, this, d.armObj, i) + ")"; });

      armg.append("line")
      .attr("stroke", function(d, i) {return extractVal(config.armColor1, this, d.armObj, i); })
      .attr("stroke-width", function(d, i) {return extractVal(config.armWidth, this, d.armObj, i); })
      .attr("stroke-linecap", "butt") // it's important the the stroke doesn't make the line any longer than it should be.
      .attr("x1", 0)
      .attr("y1", function(d) {return d.r; })
      .attr("x2", 0)
      .attr("y2", function(d, i) {return d.r + extractVal(config.armLength1, this, d.armObj, i); })
      .attr("transform", function(d, i) {return "rotate(" + extractVal(config.armAngle, this, d.armObj, i) + ")"; });

      // projected bounding box
      function boundsPoints(pointSelection) {
        var xmin = NaN;
        var xmax = NaN;
        var ymin = NaN;
        var ymax = NaN;

        pointSelection.each(function(d, i) {
          var latLng = new L.LatLng(extractVal(config.hubLat, this, d, i), extractVal(config.hubLng, this, d, i));
          var point = map.project(latLng);
          if (isNaN(xmin) || point.x < xmin) {
            xmin = point.x
          }
          if (isNaN(xmax) || point.x > xmax) {
            xmax = point.x
          }
          if (isNaN(ymin) || point.y < ymin) {
            ymin = point.y
          }
          if (isNaN(ymax) || point.y > ymax) {
            ymax = point.y
          }
        });
        
        // Defaults if no data
        if (isNaN(xmin) || isNaN(xmax) || isNaN(ymin) || isNaN(ymax)) {
          xmin = 0;
          ymin = 0;
          xmax = 0;
          ymax = 0;
          console.warn("boundPoints NaN (was selection empty?)")
        }

        return [[xmin, ymin],[xmax, ymax]];
      }

      function padBounds(bounds, pad) {
        var xmin = bounds[0][0] - pad;
        var xmax = bounds[1][0] + pad;
        var ymin = bounds[0][1] - pad;
        var ymax = bounds[1][1] + pad;

        return [[xmin, ymin],[xmax, ymax]];
      }

      // returns svg translation for d3 data object
      function pinPoint(d, i) {
        var latLng = new L.LatLng(extractVal(config.hubLat, this, d, i), extractVal(config.hubLng, this, d, i));
        var point = map.latLngToLayerPoint(latLng);
        return "translate(" + point.x + "," + point.y + ")";
      }

      function zoomToData() {
        var bounds = boundsPoints(hubg);
        console.log(bounds);
        bounds = padBounds(bounds, 0);
        console.log(L.point(bounds[0][0], bounds[0][1]));
        console.log(map.unproject(L.point(bounds[0][0], bounds[0][1])));
        
        var tl = map.unproject(L.point(bounds[0][0], bounds[0][1]));
        var br = map.unproject(L.point(bounds[1][0], bounds[1][1]));
        
        console.log(tl);
        console.log(br);
        
        var latLngBounds = L.latLngBounds(tl, br)
        console.log(bounds);
        console.log(latLngBounds);
        map.fitBounds(latLngBounds);
      }
      zoomToData();
    });
  }

  // Define accessor functions for all config variables
  Object.keys(config).forEach(function(varname) {
    chart[varname] = accessor(varname);
  })

  // Creates acessor function for a config variable
  //
  // Usage:
  // chart.width = accessor("width");
  // chart.width(5); => chart
  // chart.width(); => 5
  function accessor(varname) {
    return function(value) {
      if (!arguments.length) return config[varname];
      config[varname] = value;
      return chart;
    }
  }

  return chart;
}
