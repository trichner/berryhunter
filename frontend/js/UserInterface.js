"use strict";

define(['Preloading', 'Constants', 'Utils'], function (Preloading, Constants, Utils) {
	let UserInterface = {};

	let gameUiPromise = Preloading.registerPartial('partials/gameUI.html')
		.then(() => {
			UserInterface.rootElement = document.getElementById('gameUI');
		});

	class ClickableIcon {
		/**
		 *
		 * @param {Node} node
		 */
		constructor(node) {
			this.clickable = false;
			this.domElement = node;

			this.domElement.addEventListener('pointerup', function (event) {
				event.stopPropagation();
				event.preventDefault();

				if (this.clickable && Utils.isFunction(this.onPointerup)) {
					this.onPointerup(event);
				}
			});
			this.domElement.addEventListener('pointerdown', function (event) {
				event.stopPropagation();
				event.preventDefault();

				if (this.clickable && Utils.isFunction(this.onPointerdown)) {
					this.onPointerdown(event);
				}
			});
			this.domElement.addEventListener('click', function (event) {
				event.stopPropagation();
				event.preventDefault();

				if (this.clickable && Utils.isFunction(this.onLeftClick)) {
					this.onLeftClick(event);
				}
			}.bind(this));
			this.domElement.addEventListener('contextmenu', function (event) {
				event.stopPropagation();
				event.preventDefault();

				if (this.clickable && Utils.isFunction(this.onRightClick)) {
					this.onRightClick(event);
				}
			}.bind(this));

			this.imageNode = this.domElement.querySelector('.itemIcon');
		}

		setIconGraphic(svgPath) {
			this.imageNode.setAttribute('src', svgPath);
			this.domElement.classList.remove('empty');
			this.domElement.classList.add('filled');
			this.clickable = true;
		}

		removeIconGraphic() {
			this.imageNode.removeAttribute('src');
			this.domElement.classList.add('empty');
			this.domElement.classList.remove('filled');
			this.clickable = false;
		}

		activate() {
			this.domElement.classList.add('active');
		}

		deactivate() {
			this.domElement.classList.remove('active');
		}

		hasIcon() {
			return this.clickable;
		}

		// TODO Display busy animation

		// TODO Display delayed click animation
	}

	class ClickableCountableIcon extends ClickableIcon {
		constructor(node) {
			super(node);

			this.countNode = this.domElement.querySelector('.count');
		}

		setCount(count) {
			if (count <= 1) {
				this.countNode.classList.add('hidden');
			} else {
				this.countNode.classList.remove('hidden');
				this.countNode.textContent = count;
			}
		}
	}

	class VitalSignBar {
		constructor(node) {
			this.domElement = node;
			this.indicator = node.querySelector('.indicator');
		}

		/**
		 *
		 * @param value 0.0 - 1.0
		 */
		setValue(value) {
			this.indicator.style.width = (value * 100).toFixed(2) + '%';
		}
	}

	UserInterface.setup = function () {
		this.rootElement.classList.remove('hidden');
		// this.rootElement.addEventListener('contextmenu', function (event) {
		// 	event.preventDefault();
		// });

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

	UserInterface.displayAvailableCrafts = function (availableCrafts, onLeftClick) {
		Utils.clearNode(this.craftingElement);

		let craftsPerColumn = Math.floor(Math.sqrt(availableCrafts.length));
		let craftsPerRow = Math.ceil(availableCrafts.length / craftsPerColumn);

		availableCrafts.forEach(function (recipe, index) {
			let craftableItemElement = this.craftableItemTemplate.cloneNode(true);
			this.craftingElement.appendChild(craftableItemElement);

			if (index % craftsPerRow) {
				craftableItemElement.classList.add('newLine');
			}

			let clickableIcon = new ClickableIcon(craftableItemElement);
			clickableIcon.onLeftClick = onLeftClick;
			clickableIcon.setIconGraphic(recipe.item.icon.path);
		}, this);

		this.craftingElement.classList.add(craftsPerRow + '-columns')
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


	return UserInterface;
});