"use strict";

define(['Utils', 'Constants'], function (Utils, Constants) {
	let Preloading = {};

	const promises = [];
	let numberOfPromises = 0;
	let loadedPromises = 0;
	Preloading.loadingBar = false;

	Preloading.executePreload = function () {
		return Promise.all(promises);
	};

	Preloading.registerPreload = function (preloadingPromise) {
		preloadingPromise.then(function (data) {
			loadedPromises++;
			if (Preloading.loadingBar) {
				Preloading.loadingBar.style.width = (loadedPromises / numberOfPromises * 100) + '%';
				if (loadedPromises >= numberOfPromises) {
					let loadingScreenElement = document.getElementById('loadingScreen');
					if (loadingScreenElement === null) {
						// Element was already removed
						return;
					}
					loadingScreenElement.classList.add('finished');

					loadingScreenElement.addEventListener('animationend', function () {
						if (this.parentNode === null) {
							// Element was already removed
							return;
						}
						this.parentNode.removeChild(loadingScreenElement);
					});
				}
			}

			return data;
		});
		// add promise to list of promises executed before setup()
		promises.push(preloadingPromise);
		numberOfPromises++;

		return preloadingPromise;
	};

	/**
	 * Create xhr promise to load svg
	 * @param svgPath
	 */
	Preloading.registerSVG = function (svgPath) {
		return Preloading.registerPreload(Utils.makeRequest({
			method: 'GET',
			url: svgPath
		}));
	};

	Preloading.registerGameObjectSVG = function (gameObjectClass, svgPath) {
		return Preloading.registerPreload(
			new Promise(function (resolve, reject) {
				let sourceScale = 1;
				if (Utils.isNumber(gameObjectClass.MAX_SIZE)){
					// Scale sourceScale according to the maximum required graphic size
					sourceScale = sourceScale * gameObjectClass.MAX_SIZE / Constants.GRAPHIC_BASE_SIZE;
				}
				gameObjectClass.svg = PIXI.Texture.fromImage(svgPath, undefined, undefined, sourceScale);
				texture.baseTexture.on('loaded', function () {
					resolve(gameObjectClass.svg);
				});
				texture.baseTexture.on('error', function () {
					reject("Error loading texture '" + svgPath + "'");
				});
			})
		);
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