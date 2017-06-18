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
	for (let i = 0; i < arguments.length; ++i){
		preloadScript(arguments[i]);
	}
}