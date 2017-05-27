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
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	BronzeTool: {
		// TODO
		icon: {file: 'toolBronzeIcon'},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	IronTool: {
		// TODO
		icon: {file: 'toolIronIcon'},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	StoneClub: {
		icon: {file: 'clubStoneIcon'},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	BronzeSword: {
		// TODO
		icon: {file: 'swordBronzeIcon'},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	IronSword: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	StoneSpear: {
		icon: {file: 'spearStoneIcon'},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	BronzeSpear: {
		// TODO
		icon: {file: 'spearBronzeIcon'},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	IronSpear: {
		icon: {file: 'spearIronIcon'},
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	StoneHammer: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	BronzeHammer: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	IronHammer: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.EQUIPMENT
	},
	Campfire: {
		icon: {file: 'campFireIcon'},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BigCampfire: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	Workbench: {
		// TODO
		icon: {file: 'workbenchIcon'},
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	Chest: {
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BigChest: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	Furnace: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	WoodWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	WoodSpikyWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	StoneWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	StoneSpikyWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BronzeWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BronzeSpikyWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	WoodDoor: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	StoneDoor: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	BronceDoor: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	IronDoor: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	IronWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	IronSpikyWall: {
		// TODO
		iconFile: '',
		graphic: {file: ''},
		type: ItemType.PLACEABLE
	},
	CookedMeat: {
		icon: {file: 'meatCookedIcon'},
		graphic: {file: ''},
		type: ItemType.CONSUMABLE
	},
	RawMeat: {
		icon: {file: 'meatRawIcon'},
		graphic: {file: ''},
		type: ItemType.CONSUMABLE
	},
	Berry: {
		icon: {file: 'berryIcon'},
		graphic: {file: ''},
		type: ItemType.CONSUMABLE
	},
	Seeds: {
		icon: {file: 'seedIcon'},
		graphic: {file: ''},
		type: ItemType.CONSUMABLE
	},
	BerryBowl: {
		icon: {file: 'berryBowlIcon'},
		graphic: {file: ''},
		type: ItemType.CONSUMABLE
	},
	Wood: {
		icon: {file: 'woodIcon'},
		graphic: {file: ''},
		type: ItemType.RESOURCE
	},
	Stone: {
		icon: {file: 'stoneIcon'},
		graphic: {file: ''},
		type: ItemType.RESOURCE
	},
	Bronze: {
		// TODO
		icon: {file: 'bronzeIcon'},
		graphic: {file: ''},
		type: ItemType.RESOURCE
	},
	Iron: {
		// TODO
		icon: {file: 'ironIcon'},
		graphic: {file: ''},
		type: ItemType.RESOURCE
	}
};

(function preloadItemIcons() {
	Object.values(Items).forEach(function (item) {
		if (item.icon && item.icon.file) {
			registerGameObjectSVG(item, 'img/items/' + item.icon.file + '.svg');
		}
	});
})();