"use strict";

define(['NameGenerator'], function (NameGenerator) {
	const PlayerName = {};

	PlayerName.get = function () {
		let playerName = {
			name: localStorage.getItem('playerName'),
			suggestion: NameGenerator.generate(),
			fromStorage: true,
		};
		if (playerName.name === null) {
			playerName.fromStorage = false;
		}

		return playerName;
	};

	PlayerName.set = function (name) {
		localStorage.setItem('playerName', name);
	};

	return PlayerName;
});