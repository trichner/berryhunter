"use strict";

define(['Preloading', 'Constants'], function (Preloading, Constants) {
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

				if (this.clickable && typeof this.onPointerup === 'function') {
					this.onPointerup(event);
				}
			});
			this.domElement.addEventListener('pointerdown', function (event) {
				event.stopPropagation();

				if (this.clickable && typeof this.onPointerdown === 'function') {
					this.onPointerdown(event);
				}
			});
			this.domElement.addEventListener('click', function (event) {
				event.stopPropagation();

				if (this.clickable && typeof this.onClick === 'function') {
					this.onClick(event);
				}
			}.bind(this));

			this.imageNode = this.domElement.querySelector('.itemIcon');
		}

		setClickable(toggle) {
			this.clickable = toggle;
			if (toggle) {
				this.domElement.classList.remove('disabled');
			} else {
				this.domElement.classList.add('disabled');
			}
		}

		setIconGraphic(svgPath) {
			this.imageNode.setAttribute('src', svgPath);
			this.domElement.classList.remove('empty');
			this.domElement.classList.add('filled');
		}

		removeIconGraphic() {
			this.imageNode.removeAttribute('src');
			this.domElement.classList.add('empty');
			this.domElement.classList.remove('filled');
		}

		activate() {
			this.domElement.classList.add('active');
		}

		deactivate() {
			this.domElement.classList.remove('active');
		}

		hasIcon() {
			return this.domElement.classList.contains('filled');
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

	UserInterface.setup = function () {
		this.rootElement.classList.remove('hidden');

		let inventoryElement = document.getElementById('inventory');
		let inventorySlot = document.querySelector('#inventory > .inventorySlot');

		this.inventorySlots = new Array(Constants.INVENTORY_SLOTS);
		this.inventorySlots[0] = new ClickableCountableIcon(inventorySlot);

		for (let i = 1; i < Constants.INVENTORY_SLOTS; ++i) {
			let inventorySlotCopy = inventorySlot.cloneNode(true);
			inventoryElement.appendChild(inventorySlotCopy);
			this.inventorySlots[i] = new ClickableCountableIcon(inventorySlotCopy);
		}
	};

	/**
	 * @param {Number} slotIndex
	 * @return {ClickableCountableIcon}
	 */
	UserInterface.getInventorySlot = function (slotIndex) {
		return this.inventorySlots[slotIndex];
	};


	return UserInterface;
});