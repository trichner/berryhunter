"use strict";
define(['Utils'], function (Utils) {

	let Preloading = {};

	const promises = [];
	let numberOfPromises = 0;
	let loadedPromises = 0;
	Preloading.loadingBar = false;

	Preloading.executePreload = function () {
		return Promise.all(promises);
	};

	Preloading.registerPreload = function (preloadingPromise) {
		preloadingPromise.then(function () {
			loadedPromises++;
			console.log('Loaded ' + loadedPromises + '/' + numberOfPromises);
			if (loadingBar) {
				loadingBar.style.width = (loadedPromises / numberOfPromises * 100) + '%';
				if (loadedPromises >= numberOfPromises) {
					console.log('Finished loading.');
					document.getElementById('loadingWrapper').classList.add('finished');
				}
			}
		});
		// add promise to list of promises executed before setup()
		promises.push(preloadingPromise);
		numberOfPromises++;
	};

	Preloading.registerGameObjectSVG = function (gameObjectClass, svgPath) {
		// Create xhr promise to load svg
		registerPreload(makeRequest({
			method: 'GET',
			url: svgPath
		})
			.then((svgText) => {
				gameObjectClass.svg = SvgLoader.load(svgText);
				return gameObjectClass.svg;
			}));
	};

	Preloading.preloadScript = function (script) {
		registerPreload(new Promise(function (resolve, reject) {
			require([script], function ($) {
				resolve();
			}, function (err) {
				reject(err);
			});
		}));
	};

	Preloading._import = function () {
		for (let i = 0; i < arguments.length; ++i) {
			preloadScript(arguments[i]);
		}
	};

	Preloading.registerPartial = function (htmlUrl) {
		let preloadingPromise = loadPartial(htmlUrl);
		registerPreload(preloadingPromise);
		return preloadingPromise;
	};

	Preloading.loadPartial = function (htmlUrl) {
		return makeRequest({
			method: 'GET',
			url: htmlUrl
		}).then(function (html) {
			switch (document.readyState) {
				case "interactive":
				case "complete":
					document.body.appendChild(htmlToElement(html));
					console.log('Loaded ' + htmlUrl + ' directly.');
					return Promise.resolve();
				case "loading":
					return new Promise(function (resolve) {
						console.log('Wait for loaded DOM for ' + htmlUrl + '.');
						document.addEventListener("DOMContentLoaded", function () {
							document.body.appendChild(htmlToElement(html));
							resolve();
						});
					});
			}
		});
	};

	return Preloading;
});