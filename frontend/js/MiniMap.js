"use strict";

class MiniMap {
	constructor(gameMap) {
		this.gameMap = gameMap;

		this.registeredGameObjects = [];

		this.size = Relative.width(15);

		this.group = new Two.Group();
		groups.overlay.add(this.group);
		this.group.translation.set(0, height - this.size);

		var background = new Two.Rectangle(this.size / 2, this.size / 2, this.size, this.size);
		this.group.add(background);
		background.fill = 'Cornsilk';
		background.stroke = background.fill;
		background.linewidth = 10;


		const sizeFactorRelatedToMapSize = 1;
		this.iconSizeFactor = width / gameMap.width * 0.15 * sizeFactorRelatedToMapSize;

		// gameMap.objects.forEach(this.add, this);


		// this.register(player);

		this.updateCallback = this.update.bind(this);
		two.bind('update', this.updateCallback);
	}

	/**
	 * Adds the icon of the object to the map.
	 * @param gameObject
	 */
	add(gameObject) {
		if (!gameObject.visibleOnMinimap()){
			return;
		}

		// Position each icon relative to its position on the real map.
		let x = gameObject.getX() / gameMap.width * this.size;
		let y = gameObject.getY() / gameMap.height * this.size;
		var minimapIcon = gameObject.createMinimapIcon(x, y, this.iconSizeFactor);
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
			gameObject.minimapIcon.translation.x = (playerCam.getX() + gameObject.getX()) / gameMap.width * this.size;
			gameObject.minimapIcon.translation.y = (playerCam.getY() + gameObject.getY()) / gameMap.width * this.size;
		}, this);
	}

	remove() {
		two.unbind('update', this.updateCallback);
		this.group.remove();
	}
}