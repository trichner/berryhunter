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

const RecipesHelper = {
	getCraftableRecipes: function (inventory) {
		let now = performance.now();
		let availableItems = {};
		inventory.slots.forEach(function (slot) {
			if (slot.isFilled()) {
				availableItems[slot.item.name] = slot.count;
			}
		});

		console.log(availableItems);

		let result = Object.values(Recipes).filter(function (recipe) {
			for (material in recipe.materials) {
				//noinspection JSUnfilteredForInLoop
				if (!availableItems.hasOwnProperty(material) ||
					availableItems[material] < recipe.materials[material]) {
					return false;
				}
			}

			return true;
		});
		console.log("Time needed:", performance.now() - now);
		return result;

	}
};