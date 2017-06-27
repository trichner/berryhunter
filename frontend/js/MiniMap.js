"use strict";

define(['Game', 'Two', 'Utils'], function (Game, Two, Utils) {
	class MiniMap {
		constructor(gameMap) {
			this.gameMap = gameMap;

			this.registeredGameObjects = [];

			this.size = Game.relativeWidth(15);

			this.group = new Two.Group();
			Game.groups.overlay.add(this.group);
			this.group.translation.set(0, Game.height - this.size);

			const background = new Two.Rectangle(this.size / 2, this.size / 2, this.size, this.size);
			this.group.add(background);
			background.fill = 'Cornsilk';
			background.stroke = background.fill;
			background.linewidth = 10;


			const sizeFactorRelatedToMapSize = 1;
			this.iconSizeFactor = Game.width / gameMap.width * 0.15 * sizeFactorRelatedToMapSize;

			// gameMap.objects.forEach(this.add, this);


			// this.register(player);

			this.updateCallback = this.update.bind(this);
			Game.two.bind('update', this.updateCallback);
		}

		/**
		 * Adds the icon of the object to the map.
		 * @param gameObject
		 */
		add(gameObject) {
			if (!gameObject.visibleOnMinimap()) {
				return;
			}

			// Position each icon relative to its position on the real map.
			let x = gameObject.getX() / this.gameMap.width * this.size;
			let y = gameObject.getY() / this.gameMap.height * this.size;
			const minimapIcon = gameObject.createMinimapIcon(x, y, this.iconSizeFactor);
			this.group.add(minimapIcon);
			return minimapIcon;
		}

		/**
		 * Adds an object to the map and keeps track of its movement.
		 * @param gameObject
		 */
		register(gameObject) {
			gameObject.minimapIcon = this.add(gameObject);
			this.registeredGameObjects.push(gameObject);
		}

		update() {
			this.registeredGameObjects.forEach(function (gameObject) {
				gameObject.minimapIcon.translation.x = (Game.player.camera.getX() + gameObject.getX()) / this.gameMap.width * this.size;
				gameObject.minimapIcon.translation.y = (Game.player.camera.getY() + gameObject.getY()) / this.gameMap.width * this.size;
			}, this);
		}

		remove() {
			Game.two.unbind('update', this.updateCallback);
			this.group.remove();
		}
	}

	return MiniMap;
});