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
	Workbench: {
		materials: {
			Wood: 40,
			Stone: 20
		},
		craftingTime: 15
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
		parameters: arguments
	}
}
function every() {
	return {
		operator: 'and',
		parameters: arguments
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
	 * @return List of recipes where enough materials are available
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
		let placeablesInView = gameMap.getObjectsInView().filter(function (gameObject) {
			return gameObject.constructor === Placeable;
		});
		let placeablesNearby = {};

		function isNearby(placeableItem) {
			if (placeablesNearby.hasOwnProperty(placeableItem.name)) {
				return placeablesNearby[placeableItem.name];
			} else {
				let nearby = placeablesInView.some(function (placeable) {
					if (placeable.is(placeableItem)) {
						let distance = placeable.getPosition().distanceToSquared(player.character.getPosition());
						return distance <= Math.pow(Constants.CRAFTING_RANGE / 2, 2);
					}
					return false;
				});
				placeablesNearby[placeableItem.name] = nearby;
				return nearby;
			}
		}

		return recipes.filter(function (recipe) {
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
	}
};