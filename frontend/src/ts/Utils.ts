'use strict';

import Promise from 'promise-polyfill';

/*
 http://stackoverflow.com/a/3885844
 */
export function isFloat(n) {
    return n === +n && n !== (n | 0);
}

export function isInteger(n) {
    return n === +n && n === (n | 0);
}

export function random(min, max?) {
    let rand = Math.random();

    if (arguments.length === 0) {
        return rand;
    } else if (arguments.length === 1) {
        if (arguments[0] instanceof Array) {
            return arguments[0][Math.floor(rand * arguments[0].length)];
        } else {
            return rand * min;
        }
    } else {
        if (min > max) {
            let tmp = min;
            min = max;
            max = tmp;
        }

        return rand * (max - min) + min;
    }
}

export function randomInt(min, max?) {
    if (arguments.length == 1) {
        return Math.floor(random(min));
    }
    return Math.floor(random(min, max));
}

export function removeElement(array, element) {
    let indexOf = array.indexOf(element);
    array.splice(indexOf, 1);
}

export const TwoDimensional = {
    angleBetween: function (x1, y1, x2, y2) {
        let atan2 = Math.atan2(y1 - y2, x1 - x2);
        return (atan2 < 0 ? Math.PI * 2 + atan2 : atan2);
    },

    /**
     *
     * @param radius
     * @param sides
     * @param flat if true, will create an array like [x1, y1, x2, y2, ...], else [{x1, y1}, {x2, y2}, ...]
     * @returns {Array}
     */
    makePolygon: function (radius, sides, flat) {
        let points = [];
        for (let i = 0; i < sides; i++) {
            let pct = (i + 0.5) / sides;
            let theta = 2 * Math.PI * pct + Math.PI / 2;
            let x = radius * Math.cos(theta);
            let y = radius * Math.sin(theta);
            if (flat) {
                points.push(x, y);
            } else {
                points.push({x, y});
            }
        }
        return points;
    }
};

export function defaultFor(arg, val) {
    return typeof arg !== 'undefined' ? arg : val;
}

export function getUrlParameter(sParam) {
    let sPageUrl = decodeURIComponent(window.location.search.substring(1)),
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

export function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

export function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

export function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export function executeRandomFunction(weightedFunctions) {
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

export function map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

export function sq(n) {
    return n * n;
}

/**
 *
 * @param {number} limitDirections 4 = only top, right, bottom, left. 8 = top, top-left, ...
 *                     Can be any number, per default no limit is applied and any angle can be returned.
 * @return {number}
 */
export function randomRotation(limitDirections?) {
    if (limitDirections === false || limitDirections === 0) {
        return 0;
    }
    if (isNumber(limitDirections)) {
        return randomInt(0, limitDirections) * Math.PI * 2 / limitDirections;
    }
    return random(0, Math.PI * 2);
}

export function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

export function svgToElement(svg) {
    const template = document.createElementNS('http://www.w3.org/2000/svg', 'template');
    template.innerHTML = svg;
    return template.firstChild;
}

/**
 *
 * @param {{method: String, url: String, [headers]: {}, [params]: String|{}}} opts
 * @returns {Promise}
 */
export function makeRequest(opts) {
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
}

export function isDefined(variable) {
    return !isUndefined(variable);
}

export function isUndefined(variable) {
    return typeof variable === 'undefined';
}

export function isFunction(variable) {
    return typeof variable === 'function';
}

export function isNumber(variable) {
    return typeof variable === 'number';
}

export function arraysEqual(a, b, compareFn) {
    if (a === b) {
        return true;
    }
    if (a == null || b == null) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }

    compareFn = compareFn || function (a, b) {
        return a === b;
    };

    for (let i = 0; i < a.length; ++i) {
        if (!compareFn(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

/**
 *
 * @param {number} a
 * @param {number} b
 * @param {number} epsilon - relative acceptable difference
 * @returns {boolean}
 */
// export function nearlyEqual(a, b, epsilon) {
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

export function nearlyEqual(a, b, epsilon) {
    if (a === b) {
        return true;
    }
    return Math.abs(a - b) < epsilon;
}

export function sortStrings(array, key) {
    return array.sort(function (a, b) {
        let valueA;
        let valueB;
        if (key) {
            valueA = a[key];
            valueB = b[key];
        } else {
            valueA = a;
            valueB = b;
        }
        return valueA.localeCompare(valueB, undefined, {sensitivity: 'base'});
    });
}

export function roundToNearest(value, nearest) {
    return Math.round(value / nearest) * nearest;
}

export function rad2deg(radians) {
    return radians * 180 / Math.PI;
}

export function deg2rad(degrees) {
    return degrees * Math.PI / 180;
}

export function resetFocus() {
    document.body.focus();
}

/*
* Disable event propagation for key and mouse events to prevent those event defaults
* from being prevented globally.
*/
export function preventInputPropagation(element, ignoredKeys?) {

    function preventKeyInputPropagation(event) {
        if (ignoredKeys.indexOf(event.which) === -1) {
            event.stopPropagation();
        }
    }

    function preventInputPropagation(event) {
        event.stopPropagation();
    }

    if (isDefined(ignoredKeys)) {
        element.addEventListener('keydown', preventKeyInputPropagation);
        element.addEventListener('keyup', preventKeyInputPropagation);
    } else {
        element.addEventListener('keydown', preventInputPropagation);
        element.addEventListener('keyup', preventInputPropagation);
    }

    element.addEventListener('mousedown', preventInputPropagation);
    element.addEventListener('mousemove', preventInputPropagation);
    element.addEventListener('mouseup', preventInputPropagation);
    element.addEventListener('click', preventInputPropagation);
}


export const dateDiffUnit = {
    milliseconds: 1,
    seconds: 1000,
    days: 24 * 60 * 60 * 1000
};

export function dateDiff(a, b, unit?) {
    if (isUndefined(unit)) {
        unit = dateDiffUnit.milliseconds;
    }

    return (a - b) / unit;
}

export function playCssAnimation(element, animationClass) {
    element.classList.remove(animationClass);
    // Use 1 render cycle delay to ensure the animation is restarted
    requestAnimationFrame(function () {
        element.classList.add(animationClass)
    });
}
