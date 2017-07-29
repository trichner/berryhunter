"use strict";

define(['Game', 'Two', 'UserInterface'], function (Game, Two, UserInterface) {
	class MiniMap {
		constructor(mapWidth, mapHeight) {
			this.mapWidth = mapWidth;
			this.mapHeight = mapHeight;

			/**
			 * All game objects added to the minimap.
			 */
			this.registeredGameObjects = [];

			/**
			 * Moveable game objects those minimap position will be updated continuously.
			 */
			this.trackedGameObjects = [];

			let container = UserInterface.getMinimapContainer();

			this.width = container.clientWidth;
			this.height = container.clientHeight;

			this.two = new Two({
				width: this.width,
				height: this.height,
				type: Two.Types.svg
			}).appendTo(container);

			const background = new Two.Rectangle(0, 0, this.width, this.height);
			this.two.add(background);
			background.fill = 'Cornsilk';
			background.stroke = background.fill;
			background.linewidth = 10;

			this.iconGroup = new Two.Group();
			this.two.add(this.iconGroup);

			const sizeFactorRelatedToMapSize = 1;
			this.iconSizeFactor = this.width / this.mapWidth * sizeFactorRelatedToMapSize;

			this.two.bind('update', update.bind(this));

			this.two.play();
		}

		/**
		 * Adds the icon of the object to the map.
		 * @param gameObject
		 */
		add(gameObject) {
			if (!gameObject.visibleOnMinimap) {
				return;
			}

			// Position each icon relative to its position on the real map.
			const minimapIcon = gameObject.createMinimapIcon();
			this.iconGroup.add(minimapIcon);

			let x = gameObject.getX() / this.mapWidth * this.width;
			let y = gameObject.getY() / this.mapHeight * this.height;
			minimapIcon.translation.set(x, y);
			minimapIcon.scale = this.iconSizeFactor;

			if (gameObject.isMoveable) {
				gameObject.minimapIcon = minimapIcon;
				this.trackedGameObjects.push(gameObject);
			}
			return minimapIcon;
		}

		remove(gameObject) {
			// TODO
		}

		clear() {
			// TODO
		}

	}

	function update() {
		this.trackedGameObjects.forEach((gameObject) => {
			gameObject.minimapIcon.translation.x = gameObject.getX() / this.mapWidth * this.width;
			gameObject.minimapIcon.translation.y = gameObject.getY() / this.mapHeight * this.height;
		});
	}

	return MiniMap;
});