"use strict";

define([
	'Game',
	'Utils',
	'Constants',
	'gameObjects/Placeable',
	'items/Recipes'
], function (Game, Utils, Constants, Placeable, Recipes) {
	//noinspection UnnecessaryLocalVariableJS
	const RecipesHelper = {
		/**
		 *
		 * @param {Inventory} inventory
		 * @return Array.<*> of recipes where enough materials are available
		 */
		getCraftableRecipes: function (inventory) {
			let availableItems = {};
			inventory.slots.forEach(function (slot) {
				if (slot.isFilled()) {
					availableItems[slot.item.name] = slot.count;
				}
			});

			return Object.values(Recipes).filter(function (recipe) {
				for (let material in recipe.materials) {
					//noinspection JSUnfilteredForInLoop
					if (!availableItems.hasOwnProperty(material) ||
						availableItems[material] < recipe.materials[material]) {
						return false;
					}
				}

				return true;
			});
		},

		checkNearbys(recipes){
			let recipesWithNear = [];
			let recipesWithoutNear = [];

			/*
			 * Step 1: Sort recipes by having a 'nearby' requirement or not
			 */
			recipes.forEach(function (recipe) {
				if (Utils.isDefined(recipe.nearby)) {
					recipesWithNear.push(recipe);
				} else {
					recipesWithoutNear.push(recipe);
				}
			});

			/*
			 * No recipes with nearby requirements - nothing to do here
			 */
			if (recipesWithNear.length === 0) {
				return recipesWithoutNear;
			}

			/*
			 * Get placeables in view as a first rough check
			 */
			let getObjectsInRange;
			if (Utils.isFunction(Game.map.getObjectsInRange)) {
				getObjectsInRange = Game.map.getObjectsInRange.bind(Game.map, Game.player.character.getPosition(), Constants.CRAFTING_RANGE);
			} else {
				getObjectsInRange = Game.map.getObjectsInView
			}

			let placeablesInView = getObjectsInRange().filter(function (gameObject) {
				return gameObject.constructor === Placeable;
			});

			/*
			 * No placeables in sight, nothing to check
			 */
			if (placeablesInView.length === 0) {
				return recipesWithoutNear;
			}

			/**
			 * Cache of specific placeables (like Campfire or Workbench) that are within crafting range - or not
			 *
			 * @type {{Placeable: boolean}}
			 */
			let placeablesNearby = {};

			function isNearby(placeableItem) {
				if (placeablesNearby.hasOwnProperty(placeableItem.name)) {
					return placeablesNearby[placeableItem.name];
				} else {
					let nearby = placeablesInView.some(function (placeable) {
						if (placeable.is(placeableItem)) {
							let distance = placeable.getPosition().distanceToSquared(Game.player.character.getPosition());
							return distance <= Math.pow(Constants.CRAFTING_RANGE, 2);
						}
						return false;
					});
					placeablesNearby[placeableItem.name] = nearby;
					return nearby;
				}
			}

			recipesWithNear = recipesWithNear.filter(function (recipe) {
				if (Utils.isDefined(recipe.nearby.operator)) {
					// Its a combinator
					switch (recipe.nearby.operator) {
						case 'or':
							return recipe.nearby.parameters.some(function (placeableItem) {
								return isNearby(placeableItem);
							});
						case 'and':
							return recipe.nearby.parameters.every(function (placeableItem) {
								return isNearby(placeableItem);
							});
						default:
							throw 'Unknown operator "' + recipe.nearby.operator + "'";
					}
				} else {
					// Should be a placeable item
					return isNearby(recipe.nearby);
				}
			});

			return recipesWithNear.concat(recipesWithoutNear);
		}
	};

	return RecipesHelper;
});