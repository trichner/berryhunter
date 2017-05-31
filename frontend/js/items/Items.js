const ItemType = {
	RESOURCE: 'RESOURCE',
	CONSUMABLE: 'CONSUMABLE',
	EQUIPMENT: 'EQUIPMENT',
	PLACEABLE: 'PLACEABLE'
};

const Items = {
	/***********************************
	 * TOOLS
	 ***********************************/
	WoodClub: {
		icon: {file: 'clubWoodIcon'},
		graphic: {
			file: 'clubWood',
			size: 40,
			offsetX: 15
		},
		type: ItemType.EQUIPMENT
	},
	StoneTool: {
		icon: {file: 'toolStoneIcon'},
		graphic: {
			file: 'toolStone',
			size: 30,
			offsetX: 10,
			offsetY: -2.5
		},
		type: ItemType.EQUIPMENT
	},
	BronzeTool: {
		icon: {file: 'toolBronzeIcon'},
		graphic: {
			file: 'toolBronze',
			size: 30,
			offsetX: 10,
			offsetY: -2.5
		},
		type: ItemType.EQUIPMENT
	},
	IronTool: {
		icon: {file: 'toolIronIcon'},
		graphic: {
			file: 'toolIron',
			size: 30,
			offsetX: 10,
			offsetY: -2.5
		},
		type: ItemType.EQUIPMENT
	},

	/***********************************
	 * WEAPONS
	 ***********************************/
	StoneClub: {
		icon: {file: 'clubStoneIcon'},
		graphic: {
			file: 'clubStone',
			size: 40,
			offsetX: 15
		},
		type: ItemType.EQUIPMENT
	},
	BronzeSword: {
		icon: {file: 'swordBronzeIcon'},
		graphic: {
			file: 'swordBronze',
			size: 40,
			offsetX: 15
		},
		type: ItemType.EQUIPMENT
	},
	IronSword: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},

	/***********************************
	 * Spears
	 ***********************************/
	StoneSpear: {
		icon: {file: 'spearStoneIcon'},
		graphic: {
			file: 'spearStone',
			size: 60,
			offsetX: 20
		},
		type: ItemType.EQUIPMENT
	},
	BronzeSpear: {
		icon: {file: 'spearBronzeIcon'},
		graphic: {
			file: 'spearBronze',
			size: 60,
			offsetX: 20
		},
		type: ItemType.EQUIPMENT
	},
	IronSpear: {
		icon: {file: 'spearIronIcon'},
		graphic: {
			file: 'spearIron',
			size: 60,
			offsetX: 20
		},
		type: ItemType.EQUIPMENT
	},

	/***********************************
	 * HAMMERS
	 ***********************************/
	StoneHammer: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	BronzeHammer: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	IronHammer: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},

	/***********************************
	 * PLACEABLES
	 ***********************************/
	Campfire: {
		icon: {file: 'campFireIcon'},
		// TODO
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BigCampfire: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	Workbench: {
		icon: {file: 'workbenchIcon'},
		// TODO
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	Chest: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BigChest: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	Furnace: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},

	/***********************************
	 * WALLS
	 ***********************************/
	WoodWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	WoodSpikyWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	StoneWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	StoneSpikyWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BronzeWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BronzeSpikyWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	IronWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	IronSpikyWall: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},

	/***********************************
	 * DOORS
	 ***********************************/
	WoodDoor: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	StoneDoor: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BronceDoor: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	IronDoor: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},

	/***********************************
	 * FOOD & HEALING
	 ***********************************/
	CookedMeat: {
		icon: {file: 'meatCookedIcon'},
		type: ItemType.CONSUMABLE
	},
	RawMeat: {
		icon: {file: 'meatRawIcon'},
		type: ItemType.CONSUMABLE
	},
	Berry: {
		icon: {file: 'berryIcon'},
		type: ItemType.CONSUMABLE
	},
	Seeds: {
		icon: {file: 'seedIcon'},
		type: ItemType.PLACEABLE
	},
	BerryBowl: {
		icon: {file: 'berryBowlIcon'},
		type: ItemType.CONSUMABLE
	},

	/***********************************
	 * RESOURCES
	 ***********************************/
	Wood: {
		icon: {file: 'woodIcon'},
		type: ItemType.RESOURCE
	},
	Stone: {
		icon: {file: 'stoneIcon'},
		type: ItemType.RESOURCE
	},
	Bronze: {
		icon: {file: 'bronzeIcon'},
		type: ItemType.RESOURCE
	},
	Iron: {
		icon: {file: 'ironIcon'},
		type: ItemType.RESOURCE
	}
};

(function preloadItemIcons() {
	for (let itemName in Items) {
		let item = Items[itemName];

		item.name = itemName;

		if (item.icon && item.icon.file) {
			registerGameObjectSVG(item.icon, 'img/items/' + item.icon.file + '.svg');
		}
		if (item.graphic && item.graphic.file) {
			registerGameObjectSVG(item.graphic, 'img/items/' + item.graphic.file + '.svg');
		}
	}
})();