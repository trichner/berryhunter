"use strict";

define([
	'Game',
	'Constants',
	'gameObjects/Border',
	'GameMapGenerator',
], function (Game, Constants, Border, GameMapGenerator) {
	class GameMap {
		constructor() {
			require(['MapEditor'], (MapEditor) => {

				if (MapEditor.isActive()) {
					let dimmensions = MapEditor.getMapDimensions();
					this.width = dimmensions.width;
					this.height = dimmensions.height;
				} else {
					this.width = Constants.BASE_MOVEMENT_SPEED;
					this.width *= 60; // FPS
					this.width *= 30; // Required seconds to get across the map

					//noinspection JSSuspiciousNameCombination
					this.height = this.width;
				}

				/*
				 * Create map borders
				 */
				Game.groups.mapBorders.add(
					new Border(0, 0, 'NORTH', this.width),
					new Border(this.width, 0, 'EAST', this.height),
					new Border(0, this.height, 'SOUTH', this.width),
					new Border(0, 0, 'WEST', this.height));

				this.objects = GameMapGenerator.generate(this.width, this.height);
			})
		}

		/**
		 * Returns an array of game objects that are currently within the given area.
		 * @param startX
		 * @param startY
		 * @param endX
		 * @param endY
		 * @return Array
		 */
		getObjects(startX, startY, endX, endY) {
			const containedObjects = this.objects.filter(function (gameObject) {
				let x = gameObject.getX();
				let y = gameObject.getY();

				return !(
				x > endX ||
				x < startX ||
				y > endY ||
				y < startY);
			});
			console.log(containedObjects.length + ' objects within ' +
				'[(' + startX.toFixed(0) + '/' + startY.toFixed(0) + ')' +
				'/(' + endX.toFixed(0) + '/' + endY.toFixed(0) + ')] .');
			return containedObjects;
		};

		getObjectsInView() {
			return this.getObjectsInRange(
				Game.player.character.getPosition(),
				Math.min(width / 2, height / 2),
			)
		};

		getObjectsInRange(position, range) {
			return this.getObjects(
				position.x - range,
				position.y - range,
				position.x + range,
				position.y + range,
			)
		};
	}

	return GameMap;
});