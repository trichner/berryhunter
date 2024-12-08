/**
 * Register of available items in the game.
 *
 */
import {ItemType} from '../features/items/logic/ItemType';
import {EquipmentSlot} from "../features/items/logic/Equipment";
import {meter2px} from './BasicConfig';
import {GraphicsConfig} from './Graphics';

/**
 * ItemName: {
 *      icon: {
 *          file: require('./relative/path/to/file.svg)
 *          svg: injected, svg node loaded from file
 *      },
 *      graphic: {
 *          file: require('./relative/path/to/file.svg)
 *          svg: injected, svg node loaded from file
 *          size: optional number, defaults to 100
 *          offsetX: optional number, defaults to 0
 *          offsetY: optional number, default to 0
 *      },
 *      definition: require('./relative/path/to/item.json)
 *      type: ItemType,
 *      equipment: {  must be defined if type == EQUIPMENT! contains configuration for equipment
 *          slot: Equipment.Slots,
 *          animation: 'stab' | 'swing'
 *      },
 *      placeable: { must be defined if type == PLACEBALE! contains configuration for placeables
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
export const ItemsConfig = {
    None: {
        definition: require('../../../api/items/none.json'),
        equipment: {
            animation: 'swing'
        }
    },

    /***********************************
     * TOOLS
     ***********************************/
    WoodClub: {
        icon: {file: require('../features/items/assets/icons/clubWoodIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/clubWood.svg'),
            size: <number> 40,
            offsetX: 15
        },
        definition: require('../../../api/items/tools/wood-club.json'),
        type: <keyof typeof ItemType> ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: <('swing' | 'stab')> 'swing'
        }
    },
    StoneTool: {
        icon: {file: require('../features/items/assets/icons/toolStoneIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/toolStone.svg'),
            size: 30,
            offsetX: 10,
            offsetY: 0
        },
        definition: require('../../../api/items/tools/stone-tool.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    BronzeTool: {
        icon: {file: require('../features/items/assets/icons/toolBronzeIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/toolBronze.svg'),
            size: 30,
            offsetX: 10,
            offsetY: 1.25
        },
        definition: require('../../../api/items/tools/bronze-tool.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    IronTool: {
        icon: {file: require('../features/items/assets/icons/toolIronIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/toolIron.svg'),
            size: 30,
            offsetX: 10,
            offsetY: 1.25
        },
        definition: require('../../../api/items/tools/iron-tool.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    TitaniumTool: {
        icon: {file: require('../features/items/assets/icons/toolTitaniumIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/toolTitanium.svg'),
            size: 35,
            offsetX: 12,
            offsetY: 1.25
        },
        definition: require('../../../api/items/tools/titanium-tool.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },

    /***********************************
     * WEAPONS
     ***********************************/
    StoneClub: {
        icon: {file: require('../features/items/assets/icons/clubStoneIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/clubStone.svg'),
            size: 40,
            offsetX: 15
        },
        definition: require('../../../api/items/swords/stone-club.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    BronzeSword: {
        icon: {file: require('../features/items/assets/icons/swordBronzeIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/swordBronze.svg'),
            size: 40,
            offsetX: 15
        },
        definition: require('../../../api/items/swords/bronze-sword.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    IronSword: {
        icon: {file: require('../features/items/assets/icons/swordIronIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/swordIron.svg'),
            size: 40,
            offsetX: 15
        },
        definition: require('../../../api/items/swords/iron-sword.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    TitaniumSword: {
        icon: {file: require('../features/items/assets/icons/swordTitaniumIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/swordTitanium.svg'),
            size: 55,
            offsetX: 23
        },
        definition: require('../../../api/items/swords/titanium-sword.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },

    /***********************************
     * Spears
     ***********************************/
    StoneSpear: {
        icon: {file: require('../features/items/assets/icons/spearStoneIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/spearStone.svg'),
            size: 60,
            offsetX: 15
        },
        definition: require('../../../api/items/spears/stone-spear.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'stab'
        }
    },
    BronzeSpear: {
        icon: {file: require('../features/items/assets/icons/spearBronzeIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/spearBronze.svg'),
            size: 60,
            offsetX: 15
        },
        definition: require('../../../api/items/spears/bronze-spear.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'stab'
        }
    },
    IronSpear: {
        icon: {file: require('../features/items/assets/icons/spearIronIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/spearIron.svg'),
            size: 60,
            offsetX: 15
        },
        definition: require('../../../api/items/spears/iron-spear.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'stab'
        }
    },
    TitaniumSpear: {
        icon: {file: require('../features/items/assets/icons/spearTitaniumIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/spearTitanium.svg'),
            size: 80,
            offsetX: 14
        },
        definition: require('../../../api/items/spears/titanium-spear.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'stab'
        }
    },

    /***********************************
     * HAMMERS
     ***********************************/
    WoodHammer: {
        icon: {file: require('../features/items/assets/icons/hammerWoodIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/hammerWood.svg'),
            size: 30,
            offsetX: 10,
            offsetY: 0
        },
        definition: require('../../../api/items/hammers/wood-hammer.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    StoneHammer: {
        icon: {file: require('../features/items/assets/icons/hammerStoneIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/hammerStone.svg'),
            size: 30,
            offsetX: 10,
            offsetY: -2.5
        },
        definition: require('../../../api/items/hammers/stone-hammer.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    BronzeHammer: {
        icon: {file: require('../features/items/assets/icons/hammerBronzeIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/hammerBronze.svg'),
            size: 30,
            offsetX: 10,
            offsetY: -2.5
        },
        definition: require('../../../api/items/hammers/bronze-hammer.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    IronHammer: {
        icon: {file: require('../features/items/assets/icons/hammerIronIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/hammerIron.svg'),
            size: 50,
            offsetX: 10,
            offsetY: -2.5
        },
        definition: require('../../../api/items/hammers/iron-hammer.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },

    /***********************************
     * PLACEABLES
     ***********************************/
    Campfire: {
        icon: {file: require('../features/items/assets/icons/fireCampIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/fireCamp.svg'),
            size: 100
        },
        definition: require('../../../api/items/placeables/campfire.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.campfire'
        }
    },
    BigCampfire: {
        icon: {file: require('../features/items/assets/icons/fireBigCampIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/fireBigCamp.svg'),
            size: 120
        },
        definition: require('../../../api/items/placeables/big-campfire.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.campfire'
        }
    },
    Workbench: {
        icon: {file: require('../features/items/assets/icons/workbench.svg')},
        graphic: {
            file: require('../features/items/assets/icons/workbench.svg'),
            size: 65
        },
        definition: require('../../../api/items/placeables/workbench.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.workbench',
            visibleOnMinimap: true
        }
    },
    WorkbenchConstruction: {
        icon: {file: require('../features/items/assets/icons/workbenchConstruction.svg')},
        graphic: {
            file: require('../features/items/assets/icons/workbenchConstruction.svg'),
            size: 65
        },
        definition: require('../../../api/items/placeables/workbench-construction.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.workbench',
            visibleOnMinimap: true
        }
    },

    // TODO Needs an actual function
    // Chest: {
    //     icon: {file: require('../img/items/chest.svg')},
    //     graphic: {
    //         file: require('../img/items/chest.svg'),
    //         size: 35
    //     },
    //     definition: require('../../../api/items/placeables/chest.json'),
    //     type: ItemType.PLACEABLE,
    //     placeable: {
    //         layer: 'placeables.chest'
    //     }
    // },
    // BigChest: {
    //     icon: {file: require('../img/items/chestBig.svg')},
    //     graphic: {
    //         file: require('../img/items/chestBig.svg'),
    //         size: 50
    //     },
    //     definition: require('../../../api/items/placeables/big-chest.json'),
    //     type: ItemType.PLACEABLE,
    //     placeable: {
    //         layer: 'placeables.chest'
    //     }
    // },

    Furnace: {
        icon: {file: require('../features/items/assets/icons/furnaceIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/furnace.svg'),
            size: 180
        },
        definition: require('../../../api/items/placeables/furnace.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.furnace',
            visibleOnMinimap: true
        }
    },

    BerrySeed: {
        icon: {file: require('../features/items/assets/icons/seedIcon.svg')},
        graphic: {
            file: GraphicsConfig.resources.berryBush.bushFile,
            size: <number> (meter2px(0.35)),
        },
        berryGraphic: {
            file: GraphicsConfig.resources.berryBush.berryFile,
            berryMaxSize: <number> GraphicsConfig.resources.berryBush.berryMaxSize,
            berryMinSize: <number> GraphicsConfig.resources.berryBush.berryMinSize,
        },
        definition: require('../../../api/items/placeables/berry-seed.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'resources.berryBush',
            visibleOnMinimap: true,
        },
    },

    /***********************************
     * WALLS
     ***********************************/
    WoodWall: {
        icon: {file: require('../features/items/assets/icons/wallWood.svg')},
        graphic: {
            file: require('../features/items/assets/icons/wallWood.svg'),
            size: 50
        },
        definition: require('../../../api/items/walls/wood-wall.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.walls',
            multiPlacing: true,
            directions: 4,
            visibleOnMinimap: true,
        }
    },
    // WoodSpikyWall: {
    // 	icon: {file: require('../img/items/woodSpikyWall.svg')},
    // 	graphic: {
    // 		file: require('../img/items/woodSpikyWall.svg'),
    // 		size: 63
    // 	},
    // 	definition: require('../../../api/items/walls/wood-spiky-wall.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.spikyWalls',
    // 		multiPlacing: true,
    // 		directions: 4,
    //      visibleOnMinimap: true
    // 	}
    // },
    StoneWall: {
        icon: {file: require('../features/items/assets/icons/wallStone.svg')},
        graphic: {
            file: require('../features/items/assets/icons/wallStone.svg'),
            size: 50
        },
        definition: require('../../../api/items/walls/stone-wall.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.walls',
            multiPlacing: true,
            directions: false,
            visibleOnMinimap: true,
        }
    },
    // StoneSpikyWall: {
    // 	icon: {file: require('../img/items/stoneSpikyWall.svg')},
    // 	graphic: {
    // 		file: require('../img/items/stoneSpikyWall.svg'),
    // 		size: 63
    // 	},
    // 	definition: require('../../../api/items/walls/stone-spiky-wall.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.spikyWalls',
    // 		multiPlacing: true,
    // 		directions: false,
    //      visibleOnMinimap: true
    // 	}
    // },
    BronzeWall: {
        icon: {file: require('../features/items/assets/icons/wallBronze.svg')},
        graphic: {
            file: require('../features/items/assets/icons/wallBronze.svg'),
            size: 50
        },
        definition: require('../../../api/items/walls/bronze-wall.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.walls',
            multiPlacing: true,
            directions: false,
            visibleOnMinimap: true,
        }
    },
    // BronzeSpikyWall: {
    // 	icon: {file: require('../img/items/bronzeSpikyWall.svg')},
    // 	graphic: {
    // 		file: require('../img/items/bronzeSpikyWall.svg'),
    // 		size: 63
    // 	},
    // 	definition: require('../../../api/items/walls/bronze-spiky-wall.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.spikyWalls',
    // 		multiPlacing: true,
    // 		directions: false,
    //      visibleOnMinimap: true,
    // 	}
    // },
    // IronWall: {
    //     // TODO
    //     icon: {file: ''},
    //     graphic: {file: ''},
    //     definition: require('../../../api/items/walls/iron-wall.json'),
    //     type: ItemType.PLACEABLE,
    //     placeable: {
    //         layer: 'placeables.walls',
    //         multiPlacing: true,
    //         visibleOnMinimap: true,
    //     }
    // },
    // IronSpikyWall: {
    // 	// TODO
    // 	icon: {file: ''},
    // 	graphic: {file: ''},
    // 	definition: require('../../../api/items/walls/iron-spiky-wall.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.spikyWalls',
    // 		multiPlacing: true,
    //      visibleOnMinimap: true,
    // 	}
    // },

    /***********************************
     * DOORS
     ***********************************/
    // WoodDoor: {
    // 	// TODO
    // 	icon: {file: ''},
    // 	graphic: {file: ''},
    // 	definition: require('../../../api/items/doors/wood-door.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.doors'
    // 	}
    // },
    // StoneDoor: {
    // 	// TODO
    // 	icon: {file: ''},
    // 	graphic: {file: ''},
    // 	definition: require('../../../api/items/doors/stone-door.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.doors'
    // 	}
    // },
    // BronzeDoor: {
    // 	// TODO
    // 	icon: {file: ''},
    // 	graphic: {file: ''},
    // 	definition: require('../../../api/items/doors/bronze-door.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.doors'
    // 	}
    // },
    // IronDoor: {
    // 	// TODO
    // 	icon: {file: ''},
    // 	graphic: {file: ''},
    // 	definition: require('../../../api/items/doors/iron-door.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'placeables.doors'
    // 	}
    // },

    /***********************************
     * FOOD & HEALING
     ***********************************/
    Berry: {
        icon: {file: require('../features/items/assets/icons/berryIcon.svg')},
        definition: require('../../../api/items/consumables/berry.json'),
        type: ItemType.CONSUMABLE
    },
    CookedMeat: {
        icon: {file: require('../features/items/assets/icons/meatCookedIcon.svg')},
        definition: require('../../../api/items/consumables/cooked-meat.json'),
        type: ItemType.CONSUMABLE
    },
    RawMeat: {
        icon: {file: require('../features/items/assets/icons/meatRawIcon.svg')},
        definition: require('../../../api/items/consumables/raw-meat.json'),
        type: ItemType.CONSUMABLE
    },
    BerryBowl: {
        icon: {file: require('../features/items/assets/icons/berryBowlIcon.svg')},
        definition: require('../../../api/items/consumables/berry-bowl.json'),
        type: ItemType.CONSUMABLE
    },
    Flower: {
        icon: {file: require('../features/game-objects/assets/resources/flower.svg')},
        definition: require('../../../api/items/consumables/flower.json'),
        type: ItemType.CONSUMABLE
    },

    /***********************************
     * RESOURCES
     ***********************************/
    Wood: {
        icon: {file: require('../features/items/assets/icons/woodIcon.svg')},
        definition: require('../../../api/items/resources/wood.json'),
        type: ItemType.RESOURCE
    },
    Stone: {
        icon: {file: require('../features/items/assets/icons/stoneIcon.svg')},
        definition: require('../../../api/items/resources/stone.json'),
        type: ItemType.RESOURCE
    },
    Bronze: {
        icon: {file: require('../features/items/assets/icons/bronzeIcon.svg')},
        definition: require('../../../api/items/resources/bronze.json'),
        type: ItemType.RESOURCE
    },
    Iron: {
        icon: {file: require('../features/items/assets/icons/ironIcon.svg')},
        definition: require('../../../api/items/resources/iron.json'),
        type: ItemType.RESOURCE
    },
    Titanium: {
        icon: {file: require('../features/items/assets/icons/titaniumIcon.svg')},
        definition: require('../../../api/items/resources/titanium.json'),
        type: ItemType.RESOURCE
    },
    Feather: {
        icon: {file: require('../features/items/assets/icons/feather.svg')},
        definition: require('../../../api/items/resources/feather.json'),
        type: ItemType.RESOURCE
    },

    /***********************************
     * SPECIAL
     ***********************************/
    MysticWand: {
        icon: {file: require('../features/items/assets/icons/wandMysticIcon.svg')},
        graphic: {
            file: require('../features/items/assets/icons/wandMystic.svg'),
            size: 60,
            offsetX: 20
        },
        definition: require('../../../api/items/mystic-wand.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
};
