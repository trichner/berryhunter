"use strict";

/**
 * XieLongUtils have to be loaded so that the functions are available in global namespace.
 */
define(['../vendor/XieLongUtils'], function () {
	let Utils = {};

	// Copy all methods from XieLongUtils into Utils
	Utils.isFloat = isFloat;
	Utils.isInteger = isInteger;
	Utils.random = random;
	Utils.randomInt = randomInt;
	Utils.removeElement = removeElement;
	Utils.TwoDimensional = TwoDimensional;
	Utils.defaultFor = defaultFor;
	Utils.getUrlParameter = getUrlParameter;
	Utils.clearNode = clearNode;
	Utils.escapeRegExp = escapeRegExp;
	Utils.replaceAll = replaceAll;

	Utils.executeRandomFunction = function (weightedFunctions) {
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
	};

	Utils.loadStrings = function (path, callback, errorCallback) {
		const ret = [];
		const req = new XMLHttpRequest();
		const decrementPreload = _getDecrementPreload.apply(this, arguments);

		req.addEventListener('error', function (resp) {
			if (errorCallback) {
				errorCallback(resp);
			} else {
				console.error(resp.responseText);
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
						console.error(req.statusText);
					}
					//p5._friendlyFileLoadError(3, path);
				}
			}
		};
		req.send(null);
		return ret;
	};

	Utils._getDecrementPreload = function () {
		let decrementPreload = arguments[arguments.length - 1];

		// when in preload decrementPreload will always be the last arg as it is set
		// with args.push() before invocation in _wrapPreload
		if ((Utils.preload || (this && this.preload)) &&
			typeof decrementPreload === 'function') {
			return decrementPreload;
		} else {
			return null;
		}
	};

	Utils.map = function (n, start1, stop1, start2, stop2) {
		return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
	};

	Utils.sq = function (n) {
		return n * n;
	};

	Utils.setClass = function (svgElement, className) {
		svgElement._renderer.elem.setAttribute('class', className);
		if (svgElement._renderer.type === 'group') {
			svgElement.children.forEach(function (child) {
				setClass(child, className);
			});
		}
	};

	Utils.hasClass = function (svgElement, className) {
		return svgElement._renderer.elem.getAttribute('class') === className;
	};

	Utils.htmlToElement = function (html) {
		const template = document.createElement('template');
		template.innerHTML = html;
		return template.content.firstChild;
	};

	Utils.svgToElement = function (svg) {
		const template = document.createElementNS('http://www.w3.org/2000/svg', 'template');
		template.innerHTML = svg;
		return template.firstChild;
	};

	/**
	 *
	 * @param {{method: String, url: String, [headers]: {}, [params]: String|{}}} opts
	 * @returns {Promise}
	 */
	Utils.makeRequest = function (opts) {
		return new Promise(function (resolve, reject) {
			const xhr = new XMLHttpRequest();
			xhr.open(opts.method, opts.url);
			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText,
					});
				}
			};
			xhr.onerror = function () {
				reject({
					status: this.status,
					statusText: xhr.statusText,
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
	};

	Utils.isDefined = function (variable) {
		return !Utils.isUndefined(variable);
	};

	Utils.isUndefined = function (variable) {
		return typeof variable === 'undefined';
	};

	Utils.isFunction = function (variable) {
		return typeof variable === 'function';
	};

	Utils.isNumber = function (variable) {
		return typeof variable === 'number';
	};

	Utils.arraysEqual = function (a, b) {
		if (a === b) {
			return true;
		}
		if (a == null || b == null) {
			return false;
		}
		if (a.length !== b.length) {
			return false;
		}

		for (let i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) {
				return false;
			}
		}
		return true;
	};

	/**
	 *
	 * @param {number} a
	 * @param {number} b
	 * @param {number} epsilon - relative acceptable difference
	 * @returns {boolean}
	 */
	// Utils.nearlyEqual = function (a, b, epsilon) {
	// 	epsilon = epsilon || 0.00001;
	//
	// 	let absA = Math.abs(a);
	// 	let absB = Math.abs(b);
	// 	let diff = Math.abs(a - b);
	//
	// 	if (a == b) { // shortcut, handles infinities
	// 		return true;
	// 	} else if (a == 0 || b == 0 || diff < Number.EPSILON) {
	// 		// a or b is zero or both are extremely close to it
	// 		// relative error is less meaningful here
	// 		return diff < (epsilon * Number.EPSILON);
	// 	} else { // use relative error
	// 		return diff / (absA + absB) < epsilon;
	// 	}
	// };

	Utils.nearlyEqual = function (a, b, epsilon) {
		if (a === b) {
			return true;
		}
		return Math.abs(a - b) < epsilon;
	};

	return Utils;
});
