"use strict";

let Relative = {
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

function executeRandomFunction(weightedFunctions) {
	let weightTotal = 0;

	weightedFunctions.forEach(function (weightedFunction) {
		weightTotal += weightedFunction.weight;
	});

	// http://stackoverflow.com/a/9330493
	const index = randomInt(weightTotal) + 1;
	let sum = 0;
	let i = 0;
	while (sum < index) {
		const weightedFunction = weightedFunctions[i++];
		sum += weightedFunction.weight;
	}
	return weightedFunctions[i - 1].func();
}

function createVector(x, y) {
	return new Two.Vector(x, y);
}

function loadStrings(path, callback, errorCallback) {
	const ret = [];
	const req = new XMLHttpRequest();
	const decrementPreload = _getDecrementPreload.apply(this, arguments);

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
				const arr = req.responseText.match(/[^\r\n]+/g);
				for (let k in arr) {
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
	let decrementPreload = arguments[arguments.length - 1];

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

function htmlToElement(html) {
	const template = document.createElement('template');
	template.innerHTML = html;
	return template.content.firstChild;
}

function makeRequest (opts) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open(opts.method, opts.url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		if (opts.headers) {
			Object.keys(opts.headers).forEach(function (key) {
				xhr.setRequestHeader(key, opts.headers[key]);
			});
		}
		let params = opts.params;
		// We'll need to stringify if we've been given an object
		// If we have a string, this is skipped.
		if (params && typeof params === 'object') {
			params = Object.keys(params).map(function (key) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
			}).join('&');
		}
		xhr.send(params);
	});
}

function isDefined(variable) {
	return !isUndefined(variable);
}

function isUndefined(variable) {
	return typeof variable === 'undefined';
}

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;

	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}