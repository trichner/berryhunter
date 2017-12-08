"use strict";
/**
 * Created by XieLong on 20.07.2016.
 */

/*
 http://stackoverflow.com/a/3885844
 */
function isFloat(n) {
    return n === +n && n !== (n | 0);
}

function isInteger(n) {
    return n === +n && n === (n | 0);
}

function random(min, max) {
    var rand = Math.random();

    if (arguments.length === 0) {
        return rand;
    } else
    if (arguments.length === 1) {
        if (arguments[0] instanceof Array) {
            return arguments[0][Math.floor(rand * arguments[0].length)];
        } else {
            return rand * min;
        }
    } else {
        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }

        return rand * (max-min) + min;
    }
}

function randomInt(min, max) {
    if (arguments.length == 1) {
        return Math.floor(random(min));
    }
    return Math.floor(random(min, max));
}

function removeElement(array, element) {
    var indexOf = array.indexOf(element);
    array.splice(indexOf, 1);
}

var TwoDimensional = {
    angleBetween: function (x1, y1, x2, y2) {
        var atan2 = Math.atan2(y1 - y2, x1 - x2);
        return (atan2 < 0 ? Math.PI * 2 + atan2 : atan2);
    },
	/**
	 *
	 * @param sides
	 * @param flat if true, will create an array like [x1, y1, x2, y2, ...], else [{x1, y1}, {x2, y2}, ...]
	 * @returns {Array}
	 */
	makePolygon: function (radius, sides, flat) {
		var points = [];
		for (var i = 0; i < sides; i++) {
			var pct = (i + 0.5) / sides;
			var theta = 2 * Math.PI * pct + Math.PI / 2;
			var x = radius * Math.cos(theta);
			var y = radius * Math.sin(theta);
			if (flat) {
				points.push(x, y);
			} else {
				points.push({x, y});
			}
		}
		return points;
	}
};

function defaultFor(arg, val) {
    return typeof arg !== 'undefined' ? arg : val;
}

function getUrlParameter(sParam) {
	var sPageUrl = decodeURIComponent(window.location.search.substring(1)),
		sUrlVariables = sPageUrl.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sUrlVariables.length; i++) {
		sParameterName = sUrlVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
}

function clearNode(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function escapeRegExp(str) {
	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}