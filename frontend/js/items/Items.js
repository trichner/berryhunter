"use strict";

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
define(['Environment', 'Utils', 'Preloading', 'items/ItemType', 'items/Equipment', 'underscore'],
	function (Environment, Utils, Preloading, ItemType, Equipment, _) {
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
					offsetY: -2.5
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
					offsetY: -2.5
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
					offsetY: -2.5
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
				// TODO
				icon: {file: ''},
				graphic: {file: ''},
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
			 ***********************************/
			StoneHammer: {
				// TODO
				icon: {file: ''},
				graphic: {file: ''},
				definition: 'hammers/stone-hammer',
				type: ItemType.EQUIPMENT,
				equipmentSlot: Equipment.Slots.HAND
			},
			BronzeHammer: {
				// TODO
				icon: {file: ''},
				graphic: {file: ''},
				definition: 'hammers/bronze-hammer',
				type: ItemType.EQUIPMENT,
				equipmentSlot: Equipment.Slots.HAND
			},
			IronHammer: {
				// TODO
				icon: {file: ''},
				graphic: {file: ''},
				definition: 'hammers/iron-hammer',
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
				definition: 'placeables/campfire',
				type: ItemType.PLACEABLE
			},
			BigCampfire: {
				icon: {file: 'bigCampFireIcon'},
				graphic: {
					file: 'bigCampFire',
					size: 65
				},
				definition: 'placeables/big-campfire',
				type: ItemType.PLACEABLE
			},
			Workbench: {
				icon: {file: 'workbenchIcon'},
				graphic: {
					file: 'workbench',
					size: 40
				},
				definition: 'placeables/workbench',
				type: ItemType.PLACEABLE
			},
			Chest: {
				// TODO
				icon: {file: ''},
				graphic: {file: ''},
				definition: 'placeables/chest',
				type: ItemType.PLACEABLE
			},
			BigChest: {
				// TODO
				icon: {file: ''},
				graphic: {file: ''},
				definition: 'placeables/big-chest',
				type: ItemType.PLACEABLE
			},
			Furnace: {
				// TODO
				icon: {file: ''},
				graphic: {file: ''},
				definition: 'placeables/furnace',
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
				// TODO
				definition: '',
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
			}
		};

		(function preloadItemIcons() {

			// Disable caching
			let cacheBuster = '';
			if (Environment.cachingEnabled()) {
				cacheBuster = '?' + (new Date()).getTime();
			}

			let definitionPath;
			if (Environment.subfolderPath()) {
				definitionPath = '../api/items/';
			} else {
				definitionPath = 'item-definitions/'
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
				if (item.definition) {
					Preloading.registerPreload(Utils.makeRequest({
						method: 'GET',
						url: definitionPath + item.definition + '.json' + cacheBuster
					}).then((itemDefinition) => {
						itemDefinition = JSON.parse(itemDefinition);
						if (item.name !== itemDefinition.item) {
							throw 'Loaded "' + item.definition + '.json" for item "' + item.name + '" but got "' + itemDefinition.item + '".';
						}

						item.id = itemDefinition.id;
						item.type = ItemType[itemDefinition.itemType];
						item.recipe = itemDefinition.recipe;
					}))
				}
			}
		})();

		return Items;
	});
