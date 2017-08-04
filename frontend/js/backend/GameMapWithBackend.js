"use strict";

define([
	'underscore',
	'Game',
	'develop/DebugCircle',
	'gameObjects/Border',
	'gameObjects/Character',
	'gameObjects/Placeable',
	'MapEditor',
	'Develop',
	'items/Equipment',
	'schema_server'
], function (_, Game, DebugCircle, Border, Character, Placeable, MapEditor, Develop, Equipment) {

	function GameMapWithBackend() {
		if (MapEditor.isActive()) {
			let dimensions = MapEditor.getMapDimensions();
			this.width = dimensions.width;
			this.height = dimensions.height;
		} else {
			this.width = 100 * 120;
			this.height = 100 * 120;
		}

		this.objects = {};
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
				case Character:
					gameObject = new Character(entity.id, entity.position.x, entity.position.y, entity.name);
					break;
				case Placeable:
					gameObject = new Placeable(entity.item,  entity.position.x, entity.position.y);
					break;
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
			for (let slot in slotsToHandle) {
				//noinspection JSUnfilteredForInLoop
				gameObject.unequipItem(slot);
			}
		}
	};

	GameMapWithBackend.prototype.newSnapshot = function (entities) {
		let removedObjects = _.clone(this.objects);
		entities.forEach((entity) => {
			delete removedObjects[entity.id];
		});

		Object.values(removedObjects).forEach((entity) => {
			this.objects[entity.id].hide();
			delete this.objects[entity.id];
		}, this);
	};

	GameMapWithBackend.prototype.getObjectsInView = function () {
		return Object.values(this.objects);
	};

	return GameMapWithBackend;
});