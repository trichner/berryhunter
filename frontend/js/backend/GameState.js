"use strict";

define(['backend/BackendConstants',
	'gameObjects/Resources',
	'gameObjects/Mobs',
	'develop/DebugCircle',
	'gameObjects/Border',
	'gameObjects/Character',
	'gameObjects/Placeable',
	'schema_client'
], function (BackendConstants, Resources, Mobs, DebugCircle, Border, Character, Placeable,) {
	class Spectator {
		/**
		 * @param {BerryhunterApi.Spectator} spectator
		 */
		constructor(spectator) {
			this.id = spectator.id();
			this.x = spectator.pos().x();
			this.y = spectator.pos().y();
			this.isSpectator = true;
		}
	}

	class GameState {
		/**
		 *
		 * @param {BerryhunterApi.GameState} gameState
		 */
		constructor(gameState) {
			this.tick = gameState.tick().toFloat64();

			switch (gameState.playerType()) {
				case BerryhunterApi.Player.Spectator:
					this.player = new Spectator(gameState.player(new BerryhunterApi.Spectator()));
					break;
				case BerryhunterApi.Player.Character:
					this.player = unmarshalEntity(
						gameState.player(new BerryhunterApi.Character()),
						BerryhunterApi.AnyEntity.Character);
					break;
			}

			this.inventory = [];
			for (let i = 0; i < gameState.inventoryLength(); ++i) {
				let itemStack = unmarshalItemStack(gameState.inventory(i));
				this.inventory[itemStack.slot] = itemStack;
			}

			this.entities = [];
			for (let i = 0; i < gameState.entitiesLength(); ++i) {
				this.entities.push(unmarshalWrappedEntity(gameState.entities(i)));
			}
		}
	}

	// let minRotation = 0;
	// let maxRotation = 0;
	// let rotations = [];
	// let printed = false;

	/**
	 * @param {BerryhunterApi.Entity} wrappedEntity
	 */
	function unmarshalWrappedEntity(wrappedEntity) {
		let eType = wrappedEntity.eType();

		if (eType === BerryhunterApi.AnyEntity.NONE) {
			return null;
		}

		let entity;

		for (let eTypeName in BerryhunterApi.AnyEntity) {
			if (BerryhunterApi.AnyEntity[eTypeName] === eType) {
				entity = new BerryhunterApi[eTypeName]();
			}
		}
		/**
		 *
		 * @type {BerryhunterApi.Mob | BerryhunterApi.Resource | BerryhunterApi.Player}
		 */
		entity = wrappedEntity.e(entity);

		return unmarshalEntity(entity, eType);
	}

	function unmarshalEntity(entity, eType) {
		let id = entity.id().toFloat64();

		if (id === 0) {
			return null;
		}

		let result = {
			id: id,
			position: {
				x: entity.pos().x(),
				y: entity.pos().y(),
			},
			radius: entity.radius(),
			type: unmarshalEntityType(entity.entityType()),
			aabb: unmarshalAABB(entity.aabb()),
		};

		if (eType === BerryhunterApi.AnyEntity.Resource) {
			result.capacity = entity.capacity();
			result.stock = entity.stock();
		}

		if (eType === BerryhunterApi.AnyEntity.Placeable) {
			result.item = unmarshalItem(entity.item());
		}

		if (eType === BerryhunterApi.AnyEntity.Mob) {
			result.rotation = entity.rotation();

			// let rotation = entity.rotation();

			// if (!printed) {
			// 	if (rotations.length < 500) {
			// 		rotations.push(rotation);
			// 	} else {
			// 		rotations.sort();
			// 		console.log(rotations);
			// 		printed = true;
			// 	}
			// }

			/*
			 Hypothetical remapping of rotations
			 */
			// let rotationDiff;
			// if (rotation > Math.PI / 2) {
			// 	rotationDiff = rotation - 2 * Math.PI;
			//
			// 	rotation = rotationDiff / 0.04 * Math.PI;
			// 	rotation = 2 * Math.PI + rotation;
			// } else {
			// 	rotationDiff = rotation;
			// 	rotation = rotationDiff / 0.04 * Math.PI;
			// }
			// result.rotation = rotation;

			// 	if (rotationDiff < maxRotation){
			// 		maxRotation = rotationDiff;
			// 		console.log("maxRotation: " + rotationDiff);
			// 	}
			// } else {
			// 	rotationDiff = rotation;
			//
			// 	if (rotationDiff > minRotation){
			// 		minRotation = rotationDiff;
			// 		console.log("minRotation: " + rotationDiff);
			// 	}
			// }
		}

		if (eType === BerryhunterApi.AnyEntity.Character) {
			result.isSpectator = false;

			result.rotation = entity.rotation();
			result.isHit = entity.isHit();
			result.actionTick = entity.actionTick();
			result.name = entity.name();
			result.equipment = [];

			result.health = entity.health();
			result.satiety = entity.satiety();
			result.bodyHeat = entity.bodyTemperature();

			for (let i = 0; i < entity.equipmentLength(); ++i) {
				result.equipment.push(unmarshalItem(entity.equipment(i)));
			}
		}

		return result
	}

	/**
	 * Has to be in sync with BerryhunterApi.EntityType
	 */
	const gameObjectClasses = [
		DebugCircle,
		Border,
		Resources.RoundTree,
		Resources.MarioTree,
		Character,
		Resources.Stone,
		Resources.Bronze,
		Resources.Iron,
		Resources.BerryBush,
		Mobs.Dodo,
		Mobs.SaberToothCat,
		Mobs.Mammoth,
		Placeable,
	];

	function unmarshalEntityType(entityType) {
		return gameObjectClasses[entityType];
	}

	/**
	 *
	 * @param {BerryhunterApi.AABB} aabb
	 */
	function unmarshalAABB(aabb) {
		return {
			LowerX: aabb.lower().x(),
			LowerY: aabb.lower().y(),
			UpperX: aabb.upper().x(),
			UpperY: aabb.upper().y(),
		}
	}

	/**
	 *
	 * @param {BerryhunterApi.ItemStack} itemStack
	 */
	function unmarshalItemStack(itemStack) {
		return {
			item: unmarshalItem(itemStack.item()),
			count: itemStack.count(),
			slot: itemStack.slot(),
		};
	}


	/**
	 * @param {number} itemId
	 */
	function unmarshalItem(itemId) {
		return BackendConstants.itemLookupTable[itemId];
	}

	return GameState;
});