"use strict";

define(['Preloading', 'Constants', 'Utils', './ClickableIcon', './ClickableCountableIcon', './VitalSignBar'],
	function (Preloading, Constants, Utils, ClickableIcon, ClickableCountableIcon, VitalSignBar) {
		const UserInterface = {};

		Preloading.registerPartial('partials/userInterface.html')
			.then(() => {
				UserInterface.rootElement = document.getElementById('gameUI');
			});

		UserInterface.setup = function () {
			setupCrafting.call(this);

			setupInventory.call(this);

			setupVitalSigns.call(this);
		};

		function setupCrafting() {
			this.craftingElement = document.getElementById('crafting');
			this.craftableItemTemplate = this.craftingElement.removeChild(this.craftingElement.querySelector('.craftableItem'));
		}

		function setupInventory() {
			let inventoryElement = document.getElementById('inventory');
			let inventorySlot = document.querySelector('#inventory > .inventorySlot');

			this.inventorySlots = new Array(Constants.INVENTORY_SLOTS);
			this.inventorySlots[0] = new ClickableCountableIcon(inventorySlot);

			for (let i = 1; i < Constants.INVENTORY_SLOTS; ++i) {
				let inventorySlotCopy = inventorySlot.cloneNode(true);
				inventoryElement.appendChild(inventorySlotCopy);
				this.inventorySlots[i] = new ClickableCountableIcon(inventorySlotCopy);
			}
		}

		function setupVitalSigns() {
			this.vitalSignsBars = {
				health: new VitalSignBar(document.getElementById('healthBar')),
				satiety: new VitalSignBar(document.getElementById('satietyBar')),
				bodyHeat: new VitalSignBar(document.getElementById('bodyHeatBar'))
			};
		}

		UserInterface.show = function () {
			this.rootElement.classList.remove('hidden');
			require(['Game'], function (Game) {
				Game.domElement.focus();
				Game.miniMap.start();
			});
		};

		UserInterface.hide = function () {
			this.rootElement.classList.add('hidden');
			require(['Game'], function (Game) {
				Game.miniMap.stop();
			});
		};

		const CRAFTABLES_NEW_LINES = [
			[],
			[1],
			[2],
			[2, 3],
			[2, 4],
			[3, 5],
			[3, 5, 6],
			[3, 5, 7],
			[3, 6, 8],
			[4, 7, 9],
			[4, 7, 9, 10],
			[4, 7, 9, 11],
			[4, 7, 10, 12],
			[4, 8, 11, 13],
			[5, 9, 12, 14],
			[5, 9, 12, 14, 15],
			[5, 9, 12, 14, 16],
			[5, 9, 12, 15, 17],
			[5, 9, 13, 16, 18],
			[5, 10, 14, 17, 19],
			[6, 11, 15, 18, 20]
		];

		UserInterface.displayAvailableCrafts = function (availableCrafts, onLeftClick) {
			Utils.clearNode(this.craftingElement);

			if (availableCrafts.length === 0) {
				return;
			}

			let newLines = CRAFTABLES_NEW_LINES[availableCrafts.length - 1];

			availableCrafts.forEach(function (recipe, index) {
				if (Utils.isUndefined(recipe.clickableIcon)) {
					let craftableItemElement = this.craftableItemTemplate.cloneNode(true);

					let clickableIcon = new ClickableIcon(craftableItemElement);
					clickableIcon.onLeftClick = function (event) {
						onLeftClick.call(clickableIcon, event, recipe);
					};
					clickableIcon.setIconGraphic(recipe.item.icon.path);
					clickableIcon.addSubIcons(recipe.materials);

					recipe.clickableIcon = clickableIcon;
				}
				recipe.clickableIcon.setHinted(!recipe.isCraftable);
				recipe.clickableIcon.appendTo(this.craftingElement);
				if (newLines.indexOf(index) === -1){
					recipe.clickableIcon.domElement.classList.remove('newLine');
				} else {
					recipe.clickableIcon.domElement.classList.add('newLine');
				}
			}, this);
		};

		UserInterface.flashInventory = function () {
			let inventoryElement = document.getElementById('inventory');
			inventoryElement.classList.remove('overfilled');
			// Use 1 render cycle delay to ensure the animation is restarted
			requestAnimationFrame(function () {
				inventoryElement.classList.add('overfilled')
			});
		};

		/**
		 * @param {Number} slotIndex
		 * @return {ClickableCountableIcon}
		 */
		UserInterface.getInventorySlot = function (slotIndex) {
			return this.inventorySlots[slotIndex];
		};

		UserInterface.getVitalSignBar = function (vitalSign) {
			return this.vitalSignsBars[vitalSign];
		};

		/**
		 *
		 * @return {Element}
		 */
		UserInterface.getMinimapContainer = function () {
			return document.querySelector('#minimap > .wrapper');
		};

		/**
		 *
		 * @return {Element}
		 */
		UserInterface.getChat = function () {
			return document.getElementById('chat');
		};

		UserInterface.getScoreboard = function () {
			return document.getElementById('scoreboard');
		};

		return UserInterface;
	});