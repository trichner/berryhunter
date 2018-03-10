'use strict';

define(['Utils', 'items/Items', './SubIcon', 'Game', 'Constants'], function (Utils, Items, SubIcon, Game, Constants) {
	class ClickableIcon {
		/**
		 * @param {Element} node
		 */
		constructor(node) {
			this.clickable = false;
			this.domElement = node;
			this.inProgress = false;

			this.onPointerup = null;
			this.onPointerdown = null;
			this.onLeftClick = null;
			this.onRightClick = null;

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
			this.progressOverlay = this.domElement.querySelector('.progressOverlay');
		}

		appendTo(element) {
			element.appendChild(this.domElement);
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

		addSubIcons(materials) {
			this.subIcons = [];
			let hasPrimary = false;
			let iconIndex = 0;
			Object.entries(materials).forEach(function (material) {
				let itemName = material[0];
				let count = material[1];
				let iconPath = Items[itemName].icon.path;

				let domElement;
				if (!hasPrimary && count === 1) {
					domElement = this.domElement.querySelector('.subIcon.primary');
					hasPrimary = true;
				} else {
					domElement = this.domElement.querySelectorAll('.subIconRow > .subIcon').item(iconIndex);
					iconIndex++;
				}

				this.subIcons.push(new SubIcon(domElement, itemName, iconPath, count, Game.player.inventory.getItemCount(itemName)));
			}, this);

			if (hasPrimary) {
				this.domElement.classList.add('upgrade');
			}

			if (iconIndex > 0) {
				this.domElement.classList.add('withIngredients');
			}
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

		setHinted(flag) {
			if (flag) {
				this.domElement.classList.add('hinted');
			} else {
				this.domElement.classList.remove('hinted');
			}
		}

		startProgress(seconds) {
			if (this.progressOverlay === null) {
				console.warn('Tried to call startProgress on an ClickableIcon without progressOverlay.');
				return;
			}

			this.progress = {
				requiredTicks: seconds * 1000 / Constants.SERVER_TICKRATE
			};
			this.progress.remainingTicks = this.progress.requiredTicks;

			this.domElement.classList.add('inProgress');
			this.progressOverlay.classList.remove('hidden');
			this.inProgress = true;

			// let self = this;
			// require(['Game'], function (Game) {
			// 	let updateListener = function () {
			// 		progress.current += Game.timeDelta;
			// 		if (progress.current >= progress.duration) {
			// 			self.progressOverlay.style.top = '100%';
			// 			self.domElement.classList.remove('inProgress');
			// 			self.progressOverlay.classList.add('hidden');
			// 			Game.renderer.off('prerender', updateListener);
			// 			self.inProgress = false;
			// 			// A little hacky - would be nice with events
			// 			Game.player.inventory.onChange();
			// 		} else {
			// 			let top = 100 - 100 * progress.current / progress.duration;
			// 			self.progressOverlay.style.top = top.toFixed(3) + '%';
			// 		}
			// 	};
			// 	Game.renderer.on('prerender', updateListener);
			// });
		}

		updateProgress(ticksRemaining) {
			if (!this.inProgress) {
				console.error("Invalid State: Received progress update, but this icon is not in progress.");
				return;
			}
			this.progress.remainingTicks = ticksRemaining;
			if (this.progress.remainingTicks <= 0) {
				this.progressOverlay.style.top = '100%';
				this.domElement.classList.remove('inProgress');
				this.progressOverlay.classList.add('hidden');
				this.inProgress = false;
				delete this.progress;
				// A little hacky - would be nice with events
				Game.player.inventory.onChange();
			} else {
				let top = 100 * this.progress.remainingTicks / this.progress.requiredTicks;
				this.progressOverlay.style.top = top.toFixed(3) + '%';
			}
		}

		// TODO Display delayed click animation
	}

	return ClickableIcon;
});

