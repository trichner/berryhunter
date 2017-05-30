/**
 * Created by XieLong on 21.05.2017.
 */
const ItemType = {
	RESOURCE: 'RESOURCE',
	CONSUMABLE: 'CONSUMABLE',
	EQUIPMENT: 'EQUIPMENT',
	PLACEABLE: 'PLACEABLE'
};

const Items = {
	WoodClub: {
		icon: {file: 'clubWoodIcon'},
		graphic: {file: 'clubWood'},
		type: ItemType.EQUIPMENT
	},
	StoneTool: {
		icon: {file: 'toolStoneIcon'},
		graphic: {file: 'toolStone'},
		type: ItemType.EQUIPMENT
	},
	BronzeTool: {
		icon: {file: 'toolBronzeIcon'},
		graphic: {file: 'toolBronze'},
		type: ItemType.EQUIPMENT
	},
	IronTool: {
		icon: {file: 'toolIronIcon'},
		graphic: {file: 'toolIron'},
		type: ItemType.EQUIPMENT
	},
	StoneClub: {
		icon: {file: 'clubStoneIcon'},
		graphic: {file: 'clubStone'},
		type: ItemType.EQUIPMENT
	},
	BronzeSword: {
		icon: {file: 'swordBronzeIcon'},
		graphic: {file: 'swordBronze'},
		type: ItemType.EQUIPMENT
	},
	IronSword: {
		// TODO
		icon: {file: ''},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	StoneSpear: {
		icon: {file: 'spearStoneIcon'},
		graphic: {file: 'spearStone'},
		type: ItemType.EQUIPMENT
	},
	BronzeSpear: {
		icon: {file: 'spearBronzeIcon'},
		graphic: {
			file: 'spearBronze',
			size: 60,
			offsetX: 10
		},
		type: ItemType.EQUIPMENT
	},
	IronSpear: {
		icon: {file: 'spearIronIcon'},
		graphic: {file: 'spearIron'},
		type: ItemType.EQUIPMENT
	},
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
	Object.values(Items).forEach(function (item) {
		if (item.icon && item.icon.file) {
			registerGameObjectSVG(item.icon, 'img/items/' + item.icon.file + '.svg');
		}
		if (item.graphic && item.graphic.file) {
			registerGameObjectSVG(item.graphic, 'img/items/' + item.graphic.file + '.svg');
		}
	});
})();