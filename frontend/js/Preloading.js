'use strict';

define(['PIXI', 'Utils', 'Constants', 'userInterface/screens/StartScreen'], function (PIXI, Utils, Constants, StartScreen) {
	let Preloading = {};

	const promises = [];
	let numberOfPromises = 0;
	let loadedPromises = 0;

	Preloading.executePreload = function (requires) {
		return Preloading.loadPartial(StartScreen.htmlFile)
			.then(function () {
				StartScreen.onDomReady();

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
			StartScreen.progress = loadedPromises / numberOfPromises;

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