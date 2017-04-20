"use strict";

var Relative = {
	width: function (value) {
		return value * width / 100;
	},

	height: function (value) {
		return value * height / 100;
	},

	x: function (x) {
		// TODO dpi?
		// if (Config.scaleResolution) {
		//     return x * width / 1920 * 1.25;
		// }
		return x;
	},

	y: function (y) {
		// TODO dpi?
		// if (Config.scaleResolution) {
		//     return y * height / 1080 * 1.25;
		// }
		return y;
	}
};



/**
 * @deprecated
 * @param c
 */
function color(c) {
	return c;
}

function createVector(x, y) {
	return new Two.Vector(x, y);
}

function loadStrings(path, callback, errorCallback) {
	var ret = [];
	var req = new XMLHttpRequest();
	var decrementPreload = _getDecrementPreload.apply(this, arguments);

	req.addEventListener('error', function (resp) {
		if (errorCallback) {
			errorCallback(resp);
		} else {
			console.log(resp.responseText);
		}
	});

	req.open('GET', path, true);
	req.onreadystatechange = function () {
		if (req.readyState === 4) {
			if (req.status === 200) {
				var arr = req.responseText.match(/[^\r\n]+/g);
				for (var k in arr) {
					ret[k] = arr[k];
				}
				if (typeof callback !== 'undefined') {
					callback(ret);
				}
				if (decrementPreload && (callback !== decrementPreload)) {
					decrementPreload();
				}
			} else {
				if (errorCallback) {
					errorCallback(req);
				} else {
					console.log(req.statusText);
				}
				//p5._friendlyFileLoadError(3, path);
			}
		}
	};
	req.send(null);
	return ret;
}

function _getDecrementPreload() {
	var decrementPreload = arguments[arguments.length - 1];

	// when in preload decrementPreload will always be the last arg as it is set
	// with args.push() before invocation in _wrapPreload
	if ((window.preload || (this && this.preload)) &&
		typeof decrementPreload === 'function') {
		return decrementPreload;
	} else {
		return null;
	}
}

function map(n, start1, stop1, start2, stop2) {
	return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

function sq(n) {
	return n * n;
}

function setClass(svgElement, className) {
	svgElement._renderer.elem.setAttribute('class', className);
	if (svgElement._renderer.type === 'group') {
		svgElement.children.forEach(function (child) {
			setClass(child, className);
		});
	}
}

function hasClass(svgElement, className) {
	return svgElement._renderer.elem.getAttribute('class') === className;
}