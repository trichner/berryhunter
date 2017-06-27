"use strict";

define(['items/Items'], function (Items) {
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

	/**
	 * Any of the provided placeables have to be nearby.
	 *
	 * @returns {{operator: string, parameters: Array}}
	 */
	function any() {
		return {
			operator: 'or',
			parameters: Array.from(arguments)
		}
	}

	/**
	 * All of the provided placeables have to be nearby.
	 *
	 * @returns {{operator: string, parameters: Array}}
	 */
	function every() {
		return {
			operator: 'and',
			parameters: Array.from(arguments)
		}
	}

	(function preloadRecipes() {
		for (let itemName in Recipes) {
			// TODO Remove Recipes that don't have an icon (yet)
			if (!Items[itemName].icon.file) {
				delete Recipes[itemName];
			} else {
				let recipe = Recipes[itemName];
				recipe.item = Items[itemName];
				recipe.name = itemName;
			}
		}
	})();

	return Recipes;
});