'use strict';

define(['PIXI', 'Utils', 'Constants'], function (PIXI, Utils, Constants) {
	let Preloading = {};

	const promises = [];
	let numberOfPromises = 0;
	let loadedPromises = 0;
	let loadingBar = false;

	Preloading.executePreload = function (requires) {
		return Preloading.loadPartial('partials/loadingScreen.html')
			.then(function () {
				loadingBar = document.getElementById('loadingBar');

				requires.forEach(function (dependency) {
					Preloading.require(dependency);
				});

				/*
				 * All modules had a chance to register preloads - now setup waits for those reloads to resolve.
				 */
				return Promise.all(promises).then(function () {
					return Promise.all(promises);
				});
			});
	};

	Preloading.require = function (dependency) {
		return Preloading.registerPreload(new Promise(function (resolve) {
			require([dependency], function (dependency) {
				resolve(dependency);
			});
		}));
	};

	Preloading.registerPreload = function (preloadingPromise) {
		preloadingPromise.then(function (data) {
			loadedPromises++;
			if (loadingBar) {
				console.log("Load Progress: " + loadedPromises + ' / ' + numberOfPromises);
				loadingBar.style.width = (loadedPromises / numberOfPromises * 100) + '%';
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
			url: svgPath,
		}));
	};

	Preloading.registerGameObjectSVG = function (gameObjectClass, svgPath, maxSize) {
		return Preloading.registerPreload(
			new Promise(function (resolve, reject) {
				let sourceScale = 1;
				if (Utils.isNumber(maxSize)) {
					// Scale sourceScale according to the maximum required graphic size
					sourceScale = sourceScale * (2 * maxSize) / Constants.GRAPHIC_BASE_SIZE;
				}
				gameObjectClass.svg = PIXI.Texture.fromImage(svgPath, undefined, undefined, sourceScale);
				gameObjectClass.svg.baseTexture.on('loaded', function () {
					resolve(gameObjectClass.svg);
				});
				gameObjectClass.svg.baseTexture.on('error', function () {
					reject("Error loading texture '" + svgPath + "'");
				});
			}),
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
			url: htmlUrl,
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