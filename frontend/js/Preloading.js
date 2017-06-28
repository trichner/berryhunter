"use strict";

define(['Utils', 'SvgLoader'], function (Utils, SvgLoader) {
	let Preloading = {};

	const promises = [];
	let numberOfPromises = 0;
	let loadedPromises = 0;
	Preloading.loadingBar = false;

	Preloading.executePreload = function () {
		return Promise.all(promises);
	};

	Preloading.registerPreload = function (preloadingPromise) {
		preloadingPromise.then(function (payload) {
			loadedPromises++;
			console.log('Loaded ' + loadedPromises + '/' + numberOfPromises + (payload ? ': ' + payload : ''));
			if (loadingBar) {
				loadingBar.style.width = (loadedPromises / numberOfPromises * 100) + '%';
				if (loadedPromises >= numberOfPromises) {
					console.log('Finished loading.');
					var loadingScreenElement = document.getElementById('loadingScreen');
					loadingScreenElement.classList.add('finished');
					loadingScreenElement.addEventListener('animationend', function () {
						this.parentNode.removeChild(loadingScreenElement);
					})
				}
			}
		});
		// add promise to list of promises executed before setup()
		promises.push(preloadingPromise);
		numberOfPromises++;
	};

	Preloading.registerGameObjectSVG = function (gameObjectClass, svgPath) {
		// Create xhr promise to load svg
		Preloading.registerPreload(Utils.makeRequest({
				method: 'GET',
				url: svgPath
			})
			.then((svgText) => {
				gameObjectClass.svg = SvgLoader.load(svgText);
				return svgPath;
			}));
	};

	Preloading.preloadScript = function (script) {
		Preloading.registerPreload(new Promise(function (resolve, reject) {
			require([script], function () {
				resolve(script);
			}, function (err) {
				reject(err);
			});
		}));
	};

	Preloading._import = function () {
		for (let i = 0; i < arguments.length; ++i) {
			Preloading.preloadScript(arguments[i]);
		}
	};

	Preloading.registerPartial = function (htmlUrl) {
		let preloadingPromise = Preloading.loadPartial(htmlUrl);
		Preloading.registerPreload(preloadingPromise);
		return preloadingPromise;
	};

	Preloading.loadPartial = function (htmlUrl) {
		return Utils.makeRequest({
			method: 'GET',
			url: htmlUrl
		}).then(function (html) {
			switch (document.readyState) {
				case "interactive":
				case "complete":
					document.body.appendChild(Utils.htmlToElement(html));
					console.log('Loaded ' + htmlUrl + ' directly.');
					return Promise.resolve();
				case "loading":
					return new Promise(function (resolve) {
						console.log('Wait for loaded DOM for ' + htmlUrl + '.');
						document.addEventListener("DOMContentLoaded", function () {
							document.body.appendChild(Utils.htmlToElement(html));
							resolve();
						});
					});
			}
		});
	};

	return Preloading;
});