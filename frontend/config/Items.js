'use strict';

/**
 * Register of available items in the game.
 *
 */
define(['items/ItemType', 'items/Equipment'], function (ItemType, Equipment) {
	//noinspection UnnecessaryLocalVariableJS
	/**
	 * ItemName: {
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
	 *      equipmentSlot: Equipment.Slots,
	 *      placeable: { must be defined! contains configuration for placeables
	 *          layer: string, defines the layer this placeable is part of.
	 *                 See Game.js for defined layers
	 *          multiPlacing: optional boolean, default false
	 *                        after placenment item stays equipped
	 *          visibleOnMinimap: optional boolean, default false
	 *                            If true, a minimap icon is created for this placeable.
	 *                            The looks have to be defined in:
	 *                            GraphicsConfig.miniMap.icons.<itemName>
	 *          directions: optional boolean|number.
	 *                      false = no rotation at all.
	 *                      4 = only 4 directions.
	 *                      8 = only 8 directions.
	 *                      If omitted, the placeable is freely rotated.
	 *      }
	 * }
	 */
	const ItemsConfig = {
		None: {
			definition: 'none',
		},

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
			definition: 'tools/wood-club',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		StoneTool: {
			icon: {file: 'toolStoneIcon'},
			graphic: {
				file: 'toolStone',
				size: 30,
				offsetX: 10,
				offsetY: 0
			},
			definition: 'tools/stone-tool',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		BronzeTool: {
			icon: {file: 'toolBronzeIcon'},
			graphic: {
				file: 'toolBronze',
				size: 30,
				offsetX: 10,
				offsetY: 2.5
			},
			definition: 'tools/bronze-tool',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronTool: {
			icon: {file: 'toolIronIcon'},
			graphic: {
				file: 'toolIron',
				size: 30,
				offsetX: 10,
				offsetY: 2.5
			},
			definition: 'tools/iron-tool',
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
			definition: 'swords/stone-club',
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
			definition: 'swords/bronze-sword',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
		IronSword: {
			icon: {file: 'swordIronIcon'},
			graphic: {
				file: 'swordIron',
				size: 40,
				offsetX: 15
			},
			definition: 'swords/iron-sword',
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
			definition: 'spears/stone-spear',
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
			definition: 'spears/bronze-spear',
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
			definition: 'spears/iron-spear',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},

		/***********************************
		 * HAMMERS
		 * Deactivated, as placeables are not
		 * yet attackable.
		 ***********************************/
		// StoneHammer: {
		// 	icon: {file: 'hammerStoneIcon'},
		// 	graphic: {
		// 		file: 'hammerStone',
		// 		size: 30,
		// 		offsetX: 10,
		// 		offsetY: -2.5
		// 	},
		// 	definition: 'hammers/stone-hammer',
		// 	type: ItemType.EQUIPMENT,
		// 	equipmentSlot: Equipment.Slots.HAND
		// },
		// BronzeHammer: {
		// 	icon: {file: 'hammerBronzeIcon'},
		// 	graphic: {
		// 		file: 'hammerBronze',
		// 		size: 30,
		// 		offsetX: 10,
		// 		offsetY: -2.5
		// 	},
		// 	definition: 'hammers/bronze-hammer',
		// 	type: ItemType.EQUIPMENT,
		// 	equipmentSlot: Equipment.Slots.HAND
		// },
		// IronHammer: {
		// 	icon: {file: 'hammerIronIcon'},
		// 	graphic: {
		// 		file: 'hammerIron',
		// 		size: 50,
		// 		offsetX: 10,
		// 		offsetY: -2.5
		// 	},
		// 	definition: 'hammers/iron-hammer',
		// 	type: ItemType.EQUIPMENT,
		// 	equipmentSlot: Equipment.Slots.HAND
		// },

		/***********************************
		 * PLACEABLES
		 ***********************************/
		Campfire: {
			icon: {file: 'fireCampIcon'},
			graphic: {
				file: 'fireCamp',
				size: 100
			},
			definition: 'placeables/campfire',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.campfire'
			}
		},
		BigCampfire: {
			icon: {file: 'fireBigCampIcon'},
			graphic: {
				file: 'fireBigCamp',
				size: 120
			},
			definition: 'placeables/big-campfire',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.campfire'
			}
		},
		Workbench: {
			icon: {file: 'workbench'},
			graphic: {
				file: 'workbench',
				size: 65
			},
			definition: 'placeables/workbench',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.workbench',
				visibleOnMinimap: true
			}
		},
		Chest: {
			icon: {file: 'chest'},
			graphic: {
				file: 'chest',
				size: 35
			},
			definition: 'placeables/chest',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.chest'
			}
		},
		BigChest: {
			icon: {file: 'chestBig'},
			graphic: {
				file: 'chestBig',
				size: 50
			},
			definition: 'placeables/big-chest',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.chest'
			}
		},
		Furnace: {
			icon: {file: 'furnaceIcon'},
			graphic: {
				file: 'furnace',
				size: 180
			},
			definition: 'placeables/furnace',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.furnace',
				visibleOnMinimap: true
			}
		},
		// Seeds: {
		// 	icon: {file: 'seedIcon'},
		// 	graphic: {
		// 		file: '../berryBush',
		// 		size: 42
		// 	},
		// 	definition: 'placeables/seeds',
		// 	type: ItemType.PLACEABLE,
		// 	placeable: {
		// 		layer: 'resources.berryBush'
		// 	}
		// },

		/***********************************
		 * WALLS
		 ***********************************/
		WoodWall: {
			icon: {file: 'wallWood'},
			graphic: {
				file: 'wallWood',
				size: 50
			},
			definition: 'walls/wood-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.walls',
				multiPlacing: true,
				directions: 4
			}
		},
		WoodSpikyWall: {
			icon: {file: 'woodSpikyWall'},
			graphic: {
				file: 'woodSpikyWall',
				size: 63
			},
			definition: 'walls/wood-spiky-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.spikyWalls',
				multiPlacing: true,
				directions: 4
			}
		},
		StoneWall: {
			icon: {file: 'wallStone'},
			graphic: {
				file: 'wallStone',
				size: 50
			},
			definition: 'walls/stone-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.walls',
				multiPlacing: true,
				directions: false
			}
		},
		StoneSpikyWall: {
			icon: {file: 'stoneSpikyWall'},
			graphic: {
				file: 'stoneSpikyWall',
				size: 63
			},
			definition: 'walls/stone-spiky-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.spikyWalls',
				multiPlacing: true,
				directions: false
			}
		},
		BronzeWall: {
			icon: {file: 'wallBronze'},
			graphic: {
				file: 'wallBronze',
				size: 50
			},
			definition: 'walls/bronze-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.walls',
				multiPlacing: true,
				directions: false
			}
		},
		BronzeSpikyWall: {
			icon: {file: 'bronzeSpikyWall'},
			graphic: {
				file: 'bronzeSpikyWall',
				size: 63
			},
			definition: 'walls/bronze-spiky-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.spikyWalls',
				multiPlacing: true,
				directions: false
			}
		},
		IronWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'walls/iron-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.walls',
				multiPlacing: true
			}
		},
		IronSpikyWall: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'walls/iron-spiky-wall',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.spikyWalls',
				multiPlacing: true
			}
		},

		/***********************************
		 * DOORS
		 ***********************************/
		WoodDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'doors/wood-door',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.doors'
			}
		},
		StoneDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'doors/stone-door',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.doors'
			}
		},
		BronzeDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'doors/bronze-door',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.doors'
			}
		},
		IronDoor: {
			// TODO
			icon: {file: ''},
			graphic: {file: ''},
			definition: 'doors/iron-door',
			type: ItemType.PLACEABLE,
			placeable: {
				layer: 'placeables.doors'
			}
		},

		/***********************************
		 * FOOD & HEALING
		 ***********************************/
		Berry: {
			icon: {file: 'berryIcon'},
			definition: 'consumables/berry',
			type: ItemType.CONSUMABLE
		},
		CookedMeat: {
			icon: {file: 'meatCookedIcon'},
			definition: 'consumables/cooked-meat',
			type: ItemType.CONSUMABLE
		},
		RawMeat: {
			icon: {file: 'meatRawIcon'},
			definition: 'consumables/raw-meat',
			type: ItemType.CONSUMABLE
		},
		BerryBowl: {
			icon: {file: 'berryBowlIcon'},
			definition: 'consumables/berry-bowl',
			type: ItemType.CONSUMABLE
		},
		Flower: {
			icon: {file: 'flowerIcon'},
			definition: 'consumables/flower',
			type: ItemType.CONSUMABLE
		},

		/***********************************
		 * RESOURCES
		 ***********************************/
		Wood: {
			icon: {file: 'woodIcon'},
			definition: 'resources/wood',
			type: ItemType.RESOURCE
		},
		Stone: {
			icon: {file: 'stoneIcon'},
			definition: 'resources/stone',
			type: ItemType.RESOURCE
		},
		Bronze: {
			icon: {file: 'bronzeIcon'},
			definition: 'resources/bronze',
			type: ItemType.RESOURCE
		},
		Iron: {
			icon: {file: 'ironIcon'},
			definition: 'resources/iron',
			type: ItemType.RESOURCE
		},
		Titanium: {
			icon: {file: 'titaniumIcon'},
			definition: 'resources/titanium',
			type: ItemType.RESOURCE
		},
		Feather: {
			icon: {file: 'feather'},
			definition: 'resources/feather',
			type: ItemType.RESOURCE
		},

		/***********************************
		 * SPECIAL
		 ***********************************/
		MysticWand: {
			icon: {file: 'wandMysticIcon'},
			graphic: {
				file: 'wandMystic',
				size: 60,
				offsetX: 20
			},
			definition: 'mystic-wand',
			type: ItemType.EQUIPMENT,
			equipmentSlot: Equipment.Slots.HAND
		},
	};

	return ItemsConfig;
});