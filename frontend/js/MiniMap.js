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

			this.iconGroup = this.two.makeGroup();
			this.iconGroup.translation.set(
				this.width / 2,
				this.height / 2
			);

			this.playerGroup = this.two.makeGroup();
			this.playerGroup.translation.set(
				this.width / 2,
				this.height / 2
			);

			const sizeFactorRelatedToMapSize = 2;
			this.scale = this.width / this.mapWidth;
			this.iconSizeFactor = this.scale * sizeFactorRelatedToMapSize;

			this.two.bind('update', update.bind(this));
		}

		start() {
			this.two.play();
		}

		stop() {
			this.two.pause();
		}

		/**
		 * Adds the icon of the object to the map.
		 * @param gameObject
		 */
		add(gameObject) {
			// Position each icon relative to its position on the real map.
			const minimapIcon = gameObject.createMinimapIcon();
			if (gameObject.constructor.name === 'Character') {
				this.playerGroup.add(minimapIcon);
			} else {
				this.iconGroup.add(minimapIcon);
			}

			let x = gameObject.getX() * this.scale;
			let y = gameObject.getY() * this.scale;
			minimapIcon.translation.set(x, y);
			minimapIcon.scale = this.iconSizeFactor;

			if (gameObject.isMoveable) {
				gameObject.minimapIcon = minimapIcon;
				this.trackedGameObjects.push(gameObject);
			}
			return minimapIcon;
		}

		clear() {
			this.trackedGameObjects.length = 0;
			this.playerGroup.remove(_.toArray(this.playerGroup.children));
			this.iconGroup.remove(_.toArray(this.iconGroup.children));
		}

	}

	function update() {
		this.trackedGameObjects.forEach(gameObject => {
			gameObject.minimapIcon.translation.x = gameObject.getX() * this.scale;
			gameObject.minimapIcon.translation.y = gameObject.getY() * this.scale;
		});
	}

	return MiniMap;
});