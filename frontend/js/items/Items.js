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
define(['Preloading', 'items/ItemType', 'items/Equipment'], function (Preloading, ItemType, Equipment) {
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
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronSword: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
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
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		BronzeHammer: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronHammer: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
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
			type: ItemType.PLACEABLE
		},
		BigCampfire: {
			icon: {file: 'bigCampFireIcon'},
			graphic: {
				file: 'bigCampFire',
				size: 65
			},
			type: ItemType.PLACEABLE
		},
		Workbench: {
			icon: {file: 'workbenchIcon'},
			graphic: {
				file: 'workbench',
				size: 40
			},
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
		Seeds: {
			icon: {file: 'seedIcon'},
			graphic: {
				file: '../berryBush',
				size: 25
			},
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
				item.icon.path = 'img/items/' + item.icon.file + '.svg';
				Preloading.registerGameObjectSVG(item.icon, item.icon.path);
			}
			if (item.graphic && item.graphic.file) {
				item.graphic.path = 'img/items/' + item.graphic.file + '.svg';
				Preloading.registerGameObjectSVG(item.graphic, item.graphic.path);
			}
		}
	})();

	return Items;
});
