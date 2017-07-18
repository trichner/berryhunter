"use strict";

define([], function () {
	let Environment = {};

	Environment.cachingEnabled = function () {
		return window.location.host !== 'localhost:63342';
	};

	Environment.subfolderPath = function () {
	return window.location.pathname.includes('/frontend/');
	};

	return Environment;
});