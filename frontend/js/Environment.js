"use strict";

define(['Utils'], function (Utils) {
	let Environment = {};

	Environment.cachingEnabled = function () {
		return window.location.host !== 'localhost:63342' && !Utils.getUrlParameter('caching');
	};

	Environment.subfolderPath = function () {
		return window.location.pathname.includes('/frontend/');
	};

	return Environment;
});