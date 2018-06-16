'use strict';

define(['Events'], function (Events) {
	Events.once('characterMoved', function () {
		console.log('characterMoved :)');
	});
});