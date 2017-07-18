/**
 * Register of available items in the game.
 *
 * {{ItemName: {
 *      icon: {
 *          file: path relative to /frontend/img/items - '.svg' gets appended
 *          svg: injected, svg node loaded from file
 *      },
 *      graphic: {
 *          file: path relative to /frontend/img/items - '.svg' gets appended
 *          svg: injected, svg node loaded from file
 *          size: optional number, defaults to 100
 *          offsetX: optional number, defaults to 0
 *          offsetY: optional number, default to 0
 *      },
 *      type: ItemType,
 *      equipmentSlot: Equipment.Slots},
 */
define(['Environment', 'Preloading', 'items/ItemType', 'items/Equipment'], function (Environment, Preloading, ItemType, Equipment) {
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
			definition: 'wood-club',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		StoneTool: {
			icon: {file: 'toolStoneIcon'},
			graphic: {
				file: 'toolStone',
				size: 30,
				offsetX: 10,
				offsetY: -2.5
			},
			definition: 'stone-tool',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		BronzeTool: {
			icon: {file: 'toolBronzeIcon'},
			graphic: {
				file: 'toolBronze',
				size: 30,
				offsetX: 10,
				offsetY: -2.5
			},
			definition: 'bronze-tool',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronTool: {
			icon: {file: 'toolIronIcon'},
			graphic: {
				file: 'toolIron',
				size: 30,
				offsetX: 10,
				offsetY: -2.5
			},
			definition: 'iron-tool',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
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
			definition: 'stone-club',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		BronzeSword: {
			icon: {file: 'swordBronzeIcon'},
			graphic: {
				file: 'swordBronze',
				size: 40,
				offsetX: 15
			},
			definition: 'bronze-sword',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronSword: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'iron-tool',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
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
			definition: 'stone-spear',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		BronzeSpear: {
			icon: {file: 'spearBronzeIcon'},
			graphic: {
				file: 'spearBronze',
				size: 60,
				offsetX: 20
			},
			definition: 'bronze-spear',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronSpear: {
			icon: {file: 'spearIronIcon'},
			graphic: {
				file: 'spearIron',
				size: 60,
				offsetX: 20
			},
			definition: 'iron-spear',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},

		/***********************************
		 * HAMMERS
		 ***********************************/
		StoneHammer: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'stone-hammer',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		BronzeHammer: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'bronze-hammer',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronHammer: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'iron-hammer',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},

		/***********************************
		 * PLACEABLES
		 ***********************************/
		Campfire: {
			icon: {file: 'campFireIcon'},
			graphic: {
				file: 'campFire',
				size: 50
			},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		BigCampfire: {
			icon: {file: 'bigCampFireIcon'},
			graphic: {
				file: 'bigCampFire',
				size: 65
			},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		Workbench: {
			icon: {file: 'workbenchIcon'},
			graphic: {
				file: 'workbench',
				size: 40
			},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		Chest: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		BigChest: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		Furnace: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		Seeds: {
			icon: {file: 'seedIcon'},
			graphic: {
				file: '../berryBush',
				size: 25
			},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},

		/***********************************
		 * WALLS
		 ***********************************/
		WoodWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		WoodSpikyWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		StoneWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		StoneSpikyWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		BronzeWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		BronzeSpikyWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		IronWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		IronSpikyWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},

		/***********************************
		 * DOORS
		 ***********************************/
		WoodDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		StoneDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		BronceDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},
		IronDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			// TODO
			definition: '',
			type: ItemType.PLACEABLE
		},

		/***********************************
		 * FOOD & HEALING
		 ***********************************/
		Berry: {
			icon: {file: 'berryIcon'},
			definition: 'berry',
			type: ItemType.CONSUMABLE
		},
		CookedMeat: {
			icon: {file: 'meatCookedIcon'},
			// TODO
			definition: '',
			type: ItemType.CONSUMABLE
		},
		RawMeat: {
			icon: {file: 'meatRawIcon'},
			// TODO
			definition: '',
			type: ItemType.CONSUMABLE
		},
		BerryBowl: {
			icon: {file: 'berryBowlIcon'},
			// TODO
			definition: '',
			type: ItemType.CONSUMABLE
		},

		/***********************************
		 * RESOURCES
		 ***********************************/
		Wood: {
			icon: {file: 'woodIcon'},
			definition: 'wood',
			type: ItemType.RESOURCE
		},
		Stone: {
			icon: {file: 'stoneIcon'},
			definition: 'stone',
			type: ItemType.RESOURCE
		},
		Bronze: {
			icon: {file: 'bronzeIcon'},
			definition: 'bronze',
			type: ItemType.RESOURCE
		},
		Iron: {
			icon: {file: 'ironIcon'},
			definition: 'iron',
			type: ItemType.RESOURCE
		}
	};

	(function preloadItemIcons() {

		// Disable caching
		let cacheBuster = '';
		if (Environment.cachingEnabled()) {
			cacheBuster = '?' + (new Date()).getTime();
		}

		for (let itemName in Items) {
			let item = Items[itemName];

			item.name = itemName;

			if (item.icon && item.icon.file) {
				item.icon.path = 'img/items/' + item.icon.file + '.svg' + cacheBuster;
				Preloading.registerGameObjectSVG(item.icon, item.icon.path);
			}
			if (item.graphic && item.graphic.file) {
				item.graphic.path = 'img/items/' + item.graphic.file + '.svg' + cacheBuster;
				Preloading.registerGameObjectSVG(item.graphic, item.graphic.path);
			}
		}
	})();

	return Items;
});
