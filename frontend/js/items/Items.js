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
		iconFile: 'clubWoodIcon',
		type: ItemType.EQUIPMENT
	},
	StoneTool: {
		iconFile: 'toolStoneIcon',
		type: ItemType.EQUIPMENT
	},
	BronzeTool: {
		// TODO
		iconFile: 'toolBronzeIcon',
		type: ItemType.EQUIPMENT
	},
	IronTool: {
		// TODO
		iconFile: 'toolIronIcon',
		type: ItemType.EQUIPMENT
	},
	StoneClub: {
		iconFile: 'clubStoneIcon',
		type: ItemType.EQUIPMENT
	},
	BronzeSword: {
		// TODO
		iconFile: 'swordBronzeIcon',
		type: ItemType.EQUIPMENT
	},
	IronSword: {
		// TODO
		iconFile: '',
		type: ItemType.EQUIPMENT
	},
	StoneSpear: {
		iconFile: 'spearStoneIcon',
		type: ItemType.EQUIPMENT
	},
	BronzeSpear: {
		// TODO
		iconFile: 'spearBronzeIcon',
		type: ItemType.EQUIPMENT
	},
	IronSpear: {
		iconFile: 'spearIronIcon',
		type: ItemType.EQUIPMENT
	},
	StoneHammer: {
		// TODO
		iconFile: '',
		type: ItemType.EQUIPMENT
	},
	BronzeHammer: {
		// TODO
		iconFile: '',
		type: ItemType.EQUIPMENT
	},
	IronHammer: {
		// TODO
		iconFile: '',
		type: ItemType.EQUIPMENT
	},
	Campfire: {
		iconFile: 'campFireIcon',
		type: ItemType.PLACEABLE
	},
	BigCampfire: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	Workbench: {
		// TODO
		iconFile: 'workbenchIcon',
		type: ItemType.PLACEABLE
	},
	Chest: {
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	BigChest: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	Furnace: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	WoodWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	WoodSpikyWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	StoneWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	StoneSpikyWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	BronzeWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	BronzeSpikyWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	WoodDoor: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	StoneDoor: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	BronceDoor: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	IronDoor: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	IronWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	IronSpikyWall: {
		// TODO
		iconFile: '',
		type: ItemType.PLACEABLE
	},
	CookedMeat: {
		iconFile: 'meatCookedIcon',
		type: ItemType.CONSUMABLE
	},
	RawMeat: {
		iconFile: 'meatRawIcon',
		type: ItemType.CONSUMABLE
	},
	Berry: {
		iconFile: 'berryIcon',
		type: ItemType.CONSUMABLE
	},
	Seeds: {
		iconFile: 'seedIcon',
		type: ItemType.CONSUMABLE
	},
	BerryBowl: {
		iconFile: 'berryBowlIcon',
		type: ItemType.CONSUMABLE
	},
	Wood: {
		iconFile: 'woodIcon',
		type: ItemType.RESOURCE
	},
	Stone: {
		iconFile: 'stoneIcon',
		type: ItemType.RESOURCE
	},
	Bronze: {
		// TODO
		iconFile: 'bronzeIcon',
		type: ItemType.RESOURCE
	},
	Iron: {
		// TODO
		iconFile: 'ironIcon',
		type: ItemType.RESOURCE
	}
};

(function preloadItemIcons() {
	Object.values(Items).forEach(function (item) {
		if (item.iconFile) {
			registerGameObjectSVG(item, 'img/items/' + item.iconFile + '.svg');
		}
	});
})();