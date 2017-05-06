"use strict";
const promises = [];

function executePreload() {
	return Promise.all(promises);
}

function registerPreload(preloadingPromise) {
	// add promise to list of promises executed before setup()
	promises.push(preloadingPromise);
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