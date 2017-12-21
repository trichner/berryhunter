"use strict";

define([
	'underscore',
	'Utils',
	'Game',
	'develop/DebugCircle',
	'gameObjects/Border',
	'gameObjects/Character',
	'gameObjects/Placeable',
	'gameObjects/Resources',
	'MapEditor',
	'Develop',
	'items/Equipment',
	'schema_server'
], function (_, Utils, Game, DebugCircle, Border, Character, Placeable, Resources, MapEditor, Develop, Equipment) {

	class GameMapWithBackend {
		constructor(radius) {
			this.radius = radius;
			this.width = 2 * radius;
			this.height = 2 * radius;

			this.objects = {};
		}

		/**
		 * @param entityId
		 * @return {GameObject}
		 */
		getObject(entityId) {
			return this.objects[entityId];
		};

		addOrUpdate(entity) {
			let gameObject = this.getObject(entity.id);
			if (gameObject) {
				// FIXME Der Server sollte mir nur Entities liefern, die sich auch geändert haben
				if (gameObject.isMoveable) {
					gameObject.setPosition(entity.position.x, entity.position.y);
					if (!gameObject.rotateOnPositioning) {
						gameObject.setRotation(entity.rotation);
					}
					if (Develop.isActive()) {
						gameObject.updateAABB(entity.aabb);
					}
				}

				if (gameObject instanceof Resources.Resource) {
					gameObject.stock = entity.stock;
				}
			} else {
				switch (entity.type) {
					case Character:
						gameObject = new Character(entity.id, entity.position.x, entity.position.y, entity.name, false);
						break;
					case Placeable:
						gameObject = new Placeable(entity.item, entity.position.x, entity.position.y);
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

				if (gameObject.visibleOnMinimap) {
					Game.miniMap.add(gameObject);
				}

				this.objects[entity.id] = gameObject;
				gameObject.id = entity.id;
				if (Develop.isActive()) {
					gameObject.updateAABB(entity.aabb);
				}
			}

			if (gameObject instanceof Resources.Resource) {
				gameObject.capacity = entity.capacity;
				gameObject.stock = entity.stock;
			}

			if (entity.type === Character) {
				/**
				 * @type {Character}
				 */
				let character = gameObject;

				/**
				 * Handle equipment
				 */
				let slotsToHandle = _.clone(Equipment.Slots);
				delete slotsToHandle.PLACEABLE;

				if (Utils.isDefined(entity.equipment)) {
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
				}

				// All Slots that are not equipped according to backend are dropped.
				for (let slot in slotsToHandle) {
					//noinspection JSUnfilteredForInLoop
					gameObject.unequipItem(slot);
				}

				/**
				 * Handle Actions
				 */
				if (entity.actionTick) {
					character.action();
					character.progressHitAnimation(entity.actionTick);
				}
			}

			if (entity.isHit){
				gameObject.playHitAnimation();
			}
		};

		newSnapshot(entities) {
			let removedObjects = _.clone(this.objects);
			entities.forEach((entity) => {
				delete removedObjects[entity.id];
			});

			Object.values(removedObjects).forEach((entity) => {
				this.objects[entity.id].hide();
				delete this.objects[entity.id];
			}, this);
		};

		getObjectsInView() {
			return Object.values(this.objects);
		};

		clear() {
			Object.values(this.objects).forEach(function (gameObject) {
				gameObject.hide();
			});
			this.objects = {};
		}
	}

	return GameMapWithBackend;
});