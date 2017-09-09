"use strict";

define([
	'Game',
	'Utils',
	'Constants',
	'gameObjects/Placeable',
	'items/Items',
	'items/Recipes',
	'underscore',
], function (Game, Utils, Constants, Placeable, Items, Recipes, _) {
	/*
	 * Combinators
	 */

	/**
	 * Any of the provided placeables have to be nearby.
	 *
	 * @returns {{operator: string, parameters: Array}}
	 */
	function any(items) {
		return {
			operator: 'or',
			parameters: items,
		}
	}

	/**
	 * All of the provided placeables have to be nearby.
	 *
	 * @returns {{operator: string, parameters: Array}}
	 */
	function every(items) {
		return {
			operator: 'and',
			parameters: items,
		}
	}


	//noinspection UnnecessaryLocalVariableJS
	const RecipesHelper = {
		/**
		 * Read all recipes from the items that have been loaded with definitions.
		 */
		setup: function () {
			for (let itemName in Items) {
				let item = Items[itemName];
				/* Only list recipes for items that
				 *	a) have a recipe and
				 *	b) have an icon
				 */
				if (Utils.isDefined(item.recipe) && item.icon.file) {
					let recipe = {
						craftingTime: item.recipe.craftTimeInSeconds,
						materials: {},
					};

					if (Utils.isDefined(item.recipe.tools)) {
						if (item.recipe.tools.length === 1) {
							recipe.nearby = Items[item.recipe.tools[0]];
						} else {
							recipe.nearby = any(item.recipe.tools.map((itemName) => {
								return Items[itemName];
							}))
						}
					}

					item.recipe.materials.forEach((material) => {
						recipe.materials[material.item] = material.count;
					});

					recipe.item = item;
					recipe.name = itemName;
					Recipes.push(recipe);
				}
			}
		},

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

			return Recipes.filter(function (recipe) {
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

		checkNearbys(recipes) {
			if (recipes.length === 0) {
				return recipes;
			}

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

			let placeablesInView = getObjectsInRange.call(Game.map).filter(function (gameObject) {
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
		},
	};

	return RecipesHelper;
});