"use strict";
const promises = [];
let numberOfPromises = 0;
let loadedPromises = 0;

function executePreload() {
	return Promise.all(promises);
}

function registerPreload(preloadingPromise) {
	preloadingPromise.then(function () {
		loadedPromises++;
		console.log('Loaded ' + loadedPromises + '/' + numberOfPromises);
	});
	// add promise to list of promises executed before setup()
	promises.push(preloadingPromise);
	numberOfPromises++;
}

function registerGameObjectSVG(gameObjectClass, svgPath) {
	// Create xhr promise to load svg
	registerPreload(makeRequest({
		method: 'GET',
		url: svgPath
	})
		.then((svgText) => {
			gameObjectClass.svg = SvgLoader.load(svgText);
			return gameObjectClass.svg;
		}));
}

function preloadScript(script) {
	registerPreload(new Promise(function (resolve, reject) {
		require([script], function ($) {
			resolve();
		}, function (err) {
			reject(err);
		});
	}));

}

function _import() {
	for (let i = 0; i < arguments.length; ++i) {
		preloadScript(arguments[i]);
	}
}

function registerPartial(htmlUrl) {
	let preloadingPromise = makeRequest({
		method: 'GET',
		url: htmlUrl
	}).then(function (html) {
		switch (document.readyState) {
			case "interactive":
			case "complete":
				document.body.appendChild(htmlToElement(html));
				return Promise.resolve();
			case "loading":
				return new Promise(function (resolve) {
					document.addEventListener("DOMContentLoaded", function () {
						document.body.appendChild(htmlToElement(html));
						resolve();
					});
				});
		}
	});
	registerPreload(preloadingPromise);
	return preloadingPromise;
}

registerPartial('partials/loadingScreen.html')
	.then(function () {
		console.log('loadingScreen loaded');
	});