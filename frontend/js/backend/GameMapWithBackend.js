"use strict";

define([
	'underscore',
	'Game',
	'develop/DebugCircle',
	'gameObjects/Border',
	'gameObjects/Character',
	'MapEditor',
	'Develop',
	'items/Equipment',
	'schema_server'
], function (_, Game, DebugCircle, Border, Character, MapEditor, Develop, Equipment) {

	function GameMapWithBackend() {
		if (MapEditor.isActive()) {
			let dimensions = MapEditor.getMapDimensions();
			this.width = dimensions.width;
			this.height = dimensions.height;
		} else {
			this.width = 100 * 100;
			this.height = 100 * 100;
		}

		/*
		 * Create map borders
		 */
		// groups.mapBorders.add(
		// 	new Border(0, 0, 'NORTH', this.width),
		// 	new Border(this.width, 0, 'EAST', this.height),
		// 	new Border(0, this.height, 'SOUTH', this.width),
		// 	new Border(0, 0, 'WEST', this.height));

		this.objects = {};
		this.objectsInView = [];

		// console.info('Map is ' + this.width + ' x ' + this.height);
		// console.log(this.objects.length + ' objects generated');
	}

	GameMapWithBackend.prototype.addOrUpdate = function (entity) {
		let gameObject = this.objects[entity.id];
		if (gameObject) {
			// FIXME Der Server sollte mir nur Entities liefern, die sich auch geändert haben
			if (gameObject.isMoveable) {
				gameObject.setPosition(entity.position.x, entity.position.y);
				gameObject.setRotation(entity.rotation);
				if (Develop.isActive()) {
					gameObject.updateAABB(entity.aabb);
				}
			}
		} else {
			switch (entity.type) {
				case Border:
					let startX = entity.aabb.LowerX;
					let startY = entity.aabb.LowerY;
					let endX = entity.aabb.UpperX;
					let endY = entity.aabb.UpperY;
					let x1, y1, x2, y2;

					if (startX > 0) {
						// Right Border
						x1 = startX;
						y1 = 0;
						x2 = x1;
						y2 = endY + startY;
					} else if (startY > 0) {
						// Bottom Border
						x1 = 0;
						y1 = startY;
						x2 = endX + startX;
						y2 = startY;
					} else if (endX <= 0) {
						// Left Border
						x1 = 0;
						y1 = 0;
						x2 = x1;
						y2 = endY + startY;
					} else if (endY <= 0) {
						// Top Border
						x1 = 0;
						y1 = 0;
						x2 = endX + startX;
						y2 = y1;
					} else {
						throw "Unknown Border orientation " + JSON.stringify(entity.aabb);
					}
					gameObject = new Border(x1, y1, x2, y2);
					break;
				case DebugCircle:
					if (!Develop.isActive()) {
						return;
					}
				// Fallthrough
				default:
					gameObject = new entity.type(entity.position.x, entity.position.y, entity.radius);
			}

			Game.miniMap.add(gameObject);

			this.objects[entity.id] = gameObject;
			gameObject.id = entity.id;
			if (Develop.isActive()) {
				gameObject.updateAABB(entity.aabb);
			}
		}

		/**
		 * Handle equipment
		 */
		if (entity.type === Character) {
			/**
			 * @type {Character}
			 */
			let character = gameObject;
			let slotsToHandle = _.clone(Equipment.Slots);
			delete slotsToHandle.PLACEABLE;

			entity.equipment.forEach((equippedItem) => {
				let slot = Equipment.Helper.getItemEquipmentSlot(equippedItem);
				delete slotsToHandle[slot];
				let currentlyEquippedItem = character.getEquippedItem(slot);
				if (currentlyEquippedItem === equippedItem) {
					return;
				}
				if (currentlyEquippedItem !== null) {
					character.unequipItem(slot);
				}
				gameObject.equipItem(equippedItem, slot);
			});

			// All Slots that are not equipped according to backend are dropped.
			for (let slot in slotsToHandle){
				//noinspection JSUnfilteredForInLoop
				gameObject.unequipItem(slot);
			}
		}

		this.objectsInView.push(gameObject);
	};

	GameMapWithBackend.prototype.newSnapshot = function () {
		this.objectsInView.length = 0;
	};

	GameMapWithBackend.prototype.getObjectsInView = function () {
		return this.objectsInView;
	};

	return GameMapWithBackend;
});