"use strict";

class Camera {
	/**
	 *
	 * @param {Character} character the Character to follow
	 */
	constructor(character) {
		this.character = character;

		/**
		 * @type {Two.Vector}
		 */
		this.translation = new Two.Vector(
			character.getX() - width / 2,
			character.getY() - height / 2);

		// this.shownGameObjects = [];

		two.bind('update', this.update.bind(this));
	}

	getX() {
		return this.translation.x;
	}

	getY() {
		return this.translation.y;
	}

	update() {
		this.translation = new Two.Vector(
			this.character.getX() - width / 2,
			this.character.getY() - height / 2);

		groups.gameObjects.translation.copy(this.translation.negate());
		groups.mapBorders.translation.copy(this.translation);
		groups.character.translation.copy(this.translation);

		if (typeof this.onUpdate === 'function'){
			this.onUpdate(this.translation);
		}
	}
}