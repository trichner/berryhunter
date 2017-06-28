"use strict";

define(['Preloading', 'Constants'], function (Preloading, Constants) {
	let UserInterface = {};

	Preloading.loadPartial('partials/gameUI.html')
		.then(() => {
			UserInterface.rootElement = document.getElementById('gameUI');
		});

	UserInterface.setup = function () {
		this.rootElement.classList.remove('hidden');

		let inventoryElement = document.getElementById('inventory');
		let inventorySlot = document.querySelector('#inventory > .inventorySlot');
		for (let i = 1; i < Constants.INVENTORY_SLOTS; ++i) {
			inventoryElement.appendChild(inventorySlot.cloneNode(true));
		}
	};


	return UserInterface;
});