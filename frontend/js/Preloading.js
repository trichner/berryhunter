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
		preloadingPromise.then(function () {
			loadedPromises++;
			if (loadingBar) {
				loadingBar.style.width = (loadedPromises / numberOfPromises * 100) + '%';
				if (loadedPromises >= numberOfPromises) {
					let loadingScreenElement = document.getElementById('loadingScreen');
					loadingScreenElement.classList.add('finished');

					let handler =
					loadingScreenElement.addEventListener('animationend', function () {
						if (this.parentNode === null){
							// Element was already removed
							return;
						}
						this.parentNode.removeChild(loadingScreenElement);
					});
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

	Preloading.registerPartial = function (htmlUrl) {
		let preloadingPromise = Preloading.loadPartial(htmlUrl);
		Preloading.registerPreload(preloadingPromise);
		return preloadingPromise;
	};

	/**
	 * USE WITH CAUTION. Only usable for components involved in loading.
	 * @param htmlUrl
	 * @returns {Promise}
	 */
	Preloading.loadPartial = function (htmlUrl) {
		return Utils.makeRequest({
			method: 'GET',
			url: htmlUrl
		}).then(function (html) {
			switch (document.readyState) {
				case "interactive":
				case "complete":
					document.body.appendChild(Utils.htmlToElement(html));
					return Promise.resolve();
				case "loading":
					return new Promise(function (resolve) {
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