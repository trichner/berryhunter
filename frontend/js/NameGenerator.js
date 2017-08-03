"use strict";

define(['Utils'], function (Utils) {
	const NameGenerator = {};


	const maleFirstNames = [
		'Arnold',
		'Arthur',
		'Bamm-Bamm',
		'Barney',
		'Bob',
		'Fred',
		'George',
		'Henry',
		'Joe',
		'Nate',
		'Oscar',
		'Pebbles',
		'Philo',
		'Sam',
		'Stoney',
		'Stony',
		'Sylvester',
		'Tex',
	];

	const femaleFirstNames = [
		'Betty',
		'Doris',
		'Pearl',
		'Tanya',
		'Wilma'
	];

	const lastNames = [
		'Flintstone',
		'Gypsum',
		'Hardrock',
		'Malachite',
		'Marble',
		'McMarble',
		'McMagma',
		'Quartz',
		'Rockhead',
		'Rockfeller',
		'Rubble',
		'Slaghead',
		'Slaghoople',
		'Slate'
	];

	function randomElement(array) {
		return array[Utils.randomInt(0, array.length)];
	}

	NameGenerator.generate = function () {
		return randomElement(maleFirstNames) + ' ' + randomElement(lastNames);
	};

	return NameGenerator;
});