function lerp(inVal, inMin, inMax, outMin, outMax) {
  let outRange = outMax - outMin;
  let inRange = inMax - inMin;
  return outMin + (inVal - inMin) * outRange / inRange;
}

export var dataSchema = {
    "graph": {
        "subsymbols": {
            "path": [
                "location"
            ],
            "marker_start": "extras",
            "marker_end": "albatross_info"
        },
        "x": "na",
        "y": "na",
        "size": "na",
        "color": {
            "bind_enum": "name",
            "55027": "cyan",
            "55028": "blue",
            "55029": "grey"
        },
        "brightness": "na",
        "texture": {
            "bind_enum": "name",
            "55027": "4",
            "55028": "5",
            "55029": "3"
        },
        "orientation": "na",
        "shape": "triangle",
        "symbol": "graph"
    },
    "location": {
        "x": {
            "bind_num": "longitude",
            "min_i": 170.0,
            "min_o": 1.0,
            "max_i": 370.0,
            "max_o": 15.0
        },
        "y": {
            "bind_num": "latitude",
            "min_i": -50.0,
            "min_o": 1.0,
            "max_i": -10.0,
            "max_o": 15.0
        },
        "size": "na",
        "color": "na",
        "brightness": "na",
        "texture": "na",
        "orientation": "na",
        "shape": "na",
        "symbol": "path"
    },
    "albatross_info": {
        "x": "na",
        "y": "na",
        "size": "2",
        "color": {
            "bind_enum": "release_date",
            "y2007m08d30": "orange",
            "y2007m08d31": "green"
        },
        "brightness": "na",
        "texture": {
            "bind_enum": "release_date",
            "y2007m08d30": "2",
            "y2007m08d31": "1"
        },
        "orientation": "na",
        "shape": "rect",
        "symbol": "marker_end"
    },
    "extras": {
        "x": "na",
        "y": "na",
        "size": "9",
        "color": "red",
        "brightness": "na",
        "texture": "1",
        "orientation": "na",
        "shape": "circle",
        "symbol": "marker_start"
    }
};

export var visSchema = {
  "properties": {
    "marker_start": {
      "type": "object",
      "properties": {
        "color": {"type": "color"},
        "size": {"type": "size"},
        "shape": {"type": "shape"}
      },
      "description": "start"
    },
    "marker_end": {
      "type": "object",
      "properties": {
        "color": {"type": "color"},
        "size": {"type": "size"},
        "shape": {"type": "shape"}
      },
      "description": "end"
    },
    "texture": {"type": "texture"},
    "color": {"type": "color"},
    "shape": {"type": "shape"},
    "path": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "x": {"type": "x", "description": "lateral"},
          "y": {"type": "y", "description": "vertical"}
        }
      }
    }
  }
};

export var defaultNotation = {
    "graph": {
        "subsymbols": {
            "path": [
                "location"
            ],
            "marker_start": "extras",
            "marker_end": "albatross_info"
        },
        "x": "na",
        "y": "na",
        "size": "na",
        "color": {
            "bind_enum": "name",
            "55027": "cyan",
            "55028": "blue",
            "55029": "grey"
        },
        "brightness": "na",
        "texture": {
            "bind_enum": "name",
            "55027": "4",
            "55028": "5",
            "55029": "3"
        },
        "orientation": "na",
        "shape": "triangle",
        "symbol": "graph"
    },
    "location": {
        "x": {
            "bind_num": "longitude",
            "min_i": 170.0,
            "min_o": 1.0,
            "max_i": 370.0,
            "max_o": 15.0
        },
        "y": {
            "bind_num": "latitude",
            "min_i": -50.0,
            "min_o": 1.0,
            "max_i": -10.0,
            "max_o": 15.0
        },
        "size": "na",
        "color": "na",
        "brightness": "na",
        "texture": "na",
        "orientation": "na",
        "shape": "na",
        "symbol": "path"
    },
    "albatross_info": {
        "x": "na",
        "y": "na",
        "size": "4",
        "color": {
            "bind_enum": "release_date",
            "y2007m08d30": "orange",
            "y2007m08d31": "green"
        },
        "brightness": "na",
        "texture": {
            "bind_enum": "release_date",
            "y2007m08d30": "2",
            "y2007m08d31": "1"
        },
        "orientation": "na",
        "shape": "rect",
        "symbol": "marker_end"
    },
    "extras": {
        "x": "na",
        "y": "na",
        "size": "9",
        "color": "red",
        "brightness": "na",
        "texture": "1",
        "orientation": "na",
        "shape": "circle",
        "symbol": "marker_start"
    }
};

export function recommend(dataSchema, visGrammar) {
  // TODO: Call visual recommendation engine
  // (For now, hardcode result in defaultNotation)
  return defaultNotation;
}

// subnotation, subdata
function bindprop(notation, data) {
  if (typeof(notation) === "object") {
    // map_num
    if ("bind_num" in notation) {
      // is a binding to an object
      let prop = notation["bind_num"];

      // numeric bindings
      let inVal = data[prop];
      let inMin = notation["min_i"];
      let outMin = notation["min_o"];
      let inMax = notation["max_i"];
      let outMax = notation["max_o"];
      let outVal = lerp(inVal, inMin, inMax, outMin, outMax);

      return outVal;
    }

    // map_enum
    if ("bind_enum" in notation) {
      let prop = notation["bind_enum"];
      let k = data[prop];
      if (!(k in notation)) {
        // May still be able to progress (return undefined),
        // but is likely an error.
        console.warn("Not in notation: " + k);
      }
      return notation[k];
    }

    // iterate over properties in notation and bind to data.
    let result = {};
    Object.keys(notation).forEach(function (k) {
      let n = notation[k];
      // recurse
      result[k] = bindprop(n, data);
    });
    
    return result;
  }
  
  // e.g. string / integer values
  return notation;
}

export function bind(notationFull, data, nodename = "graph") {
  let notation = notationFull[nodename];
  let result = bindprop(notation, data);
  if ("subsymbols" in notation) {
    // process class (multiple items)
    //let symname = notation["symbol"]; // TODO: Utilise this? (but need to find way that doesn't lead to redundnacy -- is always just an item/val)
    let subsymbols = notation["subsymbols"]

    // iterate over properties in notation and bind to data.
    Object.keys(subsymbols).forEach(function (subsymName) {
      let subnodename = subsymbols[subsymName];
      
      if (Array.isArray(subnodename)) {
        // class (each element is a data class to include in the array)
        result[subsymName] = subnodename.flatMap(function(name) {
          return data[name].map(function(d) {
            return bind(notationFull, d, name);
          });
        });
      } else {
        // inst (single element)
        result[subsymName] = bind(notationFull, data[subnodename], subnodename);
      }
    });
  }
  return result;  
}

// Code to generate symbol SVGs

var svgns = "http://www.w3.org/2000/svg";

var get_default = function(key) {
  let defaults = {
    "posx": 10,
    "posy": 10,
    "size": "8",
    "color": "grey",
    "brightness": "4",
    "texture": "1",
    "orientation": "rot30",
    "shape": "circle"
  };
  return defaults[key];
}

var namedColor = function (colorname) {
  if (colorname === "na") {
    colorname = get_default("color");
  }
  let colorhues = {
    "red": 0,
    "orange": 30, // Humans sensitive to orange
    "yellow": 60,
    "green": 120,
    "cyan": 180,
    "blue": 240,
    "magenta": 300
  };
  var hue;
  var sat;
  if (colorname === "grey") {
    hue = 0;
    sat = 0;
  } else {
    hue = colorhues[colorname];
    sat = 100;
  }
  return { "hue": hue, "sat": sat };
};

var namedBrightness = function (bname) {
  if (bname === "na") {
    bname = get_default("brightness");
  }
  let lev = +bname;
  // 1 => 0%, 7 => 100%
  let val = (lev - 1) * 100 / 6;
  return val;
};

// var namedTexture = function (tname) {
//   if (tname === "na") {
//     tname = get_default("texture");
//   }
//   let tnum = +tname;
//   return "url(#linebg" + tnum + ")";
// };

var namedOrient = function (oname) {
  if (oname === "na") {
    oname = get_default("orientation");
  }
  // e.g. deg0;deg30;deg90;deg60
  let onum = +oname.substr(3); // extract number
  return onum;
};

var namedSize = function (sname) {
  if (sname === "na") {
    sname = get_default("size");
  }
  let snum = +sname;
  return snum * 5;
};

export function createSymbolSvgFull (posx, posy, size, value, texture, color, orient, shape) {
  let huesat = namedColor(color);
  let hue = huesat.hue;
  let sat = huesat.sat;
  let lightness = namedBrightness(value);
  // TODO: Correct for different perceptual brightness
  let colorCombo = "hsl(" + hue + ", " + sat + "%, " + lightness + "%)";
  // TODO: Allow changing orientation of texture without altering orientation
  // of shape. (Okay for now, but will be needed for area)
  let rot = namedOrient(orient);
  let dim = namedSize(size);
  let node;
  if (shape === "circle") {
    node = document.createElementNS(svgns, "circle")
    node.setAttribute("r", dim/2);
    node.setAttribute("cx", dim/2);
    node.setAttribute("cy", dim/2);
  } else if (shape === "rect") {
    node = document.createElementNS(svgns, "rect");
    node.setAttribute("width", dim);
    node.setAttribute("height", dim);
  } else {
    node = document.createElementNS(svgns, "g");
    let poly = document.createElementNS(svgns, "polygon");
    if (shape === "triangle") {
      // designed to point in correct direction if used as a marker with orient=auto
      poly.setAttribute("points", "8 0 -6.92 -8 -6.92 8");
    } else if (shape === "hexagon") {
      poly.setAttribute("points", "-4 -8 4 -8 8 0 4 8 -4 8 -8 0");
    } else if (shape === "na") {
      // line segment
      poly.setAttribute("points", "-8 -1 -8 1 8 1 8 -1");
    }
    node.appendChild(poly);
    poly.setAttribute("transform", "scale(" + dim/16 + ") translate(6.92,8)")
  }
  node.setAttribute("fill", colorCombo);
  let g = document.createElementNS(svgns, "g");
  // Sets the texture by applying a mask. Temporarily disabled as won't work unless mask ids #linebg1, #linebg2, etc. defined in svg:defs.
  //let pat = namedTexture(texture);
  //g.setAttribute("mask", pat)
  g.appendChild(node);
  g.setAttribute("transform", "translate(" + posx + ", " + posy + ") rotate(" + rot + ", " + dim/2 + ", " + dim/2 + ")");
  return g;
};

export function createSymbolSvg (color, shape) {
  // Size currently fixed at 20 in order to centre shape and prevent clipping within viewBox="0 0 100 100"
  return createSymbolSvgFull(0, 0, 20, "na", "na", color, "rot0", shape);
}
