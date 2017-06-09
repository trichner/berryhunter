"use strict";

const Fire = any(
	Items.Campfire,
	Items.BigCampfire,
	Items.Furnace);

const Recipes = {
	/***********************************
	 * TOOLS
	 ***********************************/
	WoodClub: {
		materials: {
			Wood: 10,
		},
		craftingTime: 5
	},
	StoneTool: {
		nearby: Items.Workbench,
		materials: {
			Wood: 60,
			Stone: 20,
			WoodClub: 1
		},
		craftingTime: 15
	},
	BronzeTool: {
		nearby: Items.Workbench,
		materials: {
			Wood: 60,
			Stone: 40,
			Bronze: 30,
			StoneTool: 1
		},
		craftingTime: 20
	},
	IronTool: {
		nearby: Items.Workbench,
		materials: {
			Stone: 100,
			Bronze: 60,
			Iron: 30,
			BronzeTool: 1
		},
		craftingTime: 30
	},

	/***********************************
	 * WEAPONS
	 ***********************************/
	StoneClub: {
		nearby: Items.Workbench,
		materials: {
			Wood: 60,
			Stone: 30,
			WoodClub: 1
		},
		craftingTime: 15
	},
	BronzeSword: {
		nearby: Items.Workbench,
		materials: {
			Wood: 80,
			Stone: 60,
			Bronze: 50,
			StoneClub: 1
		},
		craftingTime: 20
	},
	IronSword: {
		nearby: Items.Workbench,
		materials: {
			Stone: 100,
			Bronze: 80,
			Iron: 50,
			BronzeSword: 1
		},
		craftingTime: 30
	},

	/***********************************
	 * SPEARS
	 ***********************************/
	StoneSpear: {
		nearby: Items.Workbench,
		materials: {
			Wood: 80,
			Stone: 20,
			WoodClub: 1
		},
		craftingTime: 15
	},
	BronzeSpear: {
		nearby: Items.Workbench,
		materials: {
			Wood: 120,
			Stone: 50,
			Bronze: 40,
			StoneSpear: 1
		},
		craftingTime: 20
	},
	IronSpear: {
		nearby: Items.Workbench,
		materials: {
			Wood: 250,
			Bronze: 80,
			Iron: 50,
			BronzeSpear: 1
		},
		craftingTime: 30
	},

	/***********************************
	 * PLACEABLES
	 ***********************************/
	Campfire: {
		materials: {
			Wood: 30,
			Stone: 5
		},
		craftingTime: 10
	},
	BigCampfire: {
		materials: {
			Wood: 40,
			Stone: 10,
			Campfire: 1
		},
		craftingTime: 10
	},
	Workbench: {
		materials: {
			Wood: 40,
			Stone: 20
		},
		craftingTime: 15
	},
	Chest: {
		materials: {
			Wood: 60,
			Stone: 20,
			Bronze: 10
		},
		craftingTime: 20
	},
	BigChest: {
		materials: {
			Wood: 100,
			Stone: 30,
			Bronze: 20,
			Chest: 1
		},
		craftingTime: 20
	},
	Furnace: {
		materials: {
			Wood: 150,
			Stone: 100,
			Bronze: 50
		},
		craftingTime: 20
	},

	/***********************************
	 * FOOD & HEALING
	 ***********************************/
	CookedMeat: {
		nearby: Fire,
		materials: {
			RawMeat: 1,
		},
		craftingTime: 10
	},
	Seeds: {
		nearby: Fire,
		materials: {
			Wood: 20,
			Berry: 3
		},
		craftingTime: 10
	},
	BerryBowl: {
		nearby: Fire,
		materials: {
			Wood: 5,
			Berry: 10,
			Seeds: 2
		},
		craftingTime: 5
	}
};

/*
 * Combinators
 */

function any() {
	return {
		operator: 'or',
		parameters: Array.from(arguments)
	}
}
function every() {
	return {
		operator: 'and',
		parameters: Array.from(arguments)
	}
}

(function preloadRecipes() {
	for (let itemName in Recipes) {
		let recipe = Recipes[itemName];
		recipe.item = Items[itemName];
		recipe.name = itemName;
	}
})();

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
			if (isDefined(recipe.nearby)) {
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
		if (isFunction(gameMap.getObjectsInRange)){
			getObjectsInRange = gameMap.getObjectsInRange.bind(gameMap, player.character.getPosition(), Constants.CRAFTING_RANGE);
		} else {
			getObjectsInRange = gameMap.getObjectsInView
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
						let distance = placeable.getPosition().distanceToSquared(player.character.getPosition());
						return distance <= Math.pow(Constants.CRAFTING_RANGE, 2);
					}
					return false;
				});
				placeablesNearby[placeableItem.name] = nearby;
				return nearby;
			}
		}

		recipesWithNear = recipesWithNear.filter(function (recipe) {
			if (isDefined(recipe.nearby.operator)) {
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