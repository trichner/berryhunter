'use strict';

define(['Utils', 'Constants'], function (Utils, Constants) {
	let Environment = {};

	Environment.cachingEnabled = function () {
		return window.location.host !== 'localhost:63342' && !Utils.getUrlParameter(Constants.MODE_PARAMETERS.SUPPRESS_CACHE_BUSTER);
	};

	/**
	 * Use it to Disable caching
	 */
	Environment.getCacheBuster = function () {
		if (this.cachingEnabled()) {
			return '?' + (new Date()).getTime();
		}

		return '';
	};

	Environment.subfolderPath = function () {
		return window.location.pathname.includes('/frontend/');
	};

	return Environment;
});