/**
 * Register of available items in the game.
 *
 */
import {ItemType} from '../ts/items/ItemType';
import {EquipmentSlot} from "../ts/items/Equipment";

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
        icon: {file: require('../img/items/clubWoodIcon.svg')},
        graphic: {
            file: require('../img/items/clubWood.svg'),
            size: 40,
            offsetX: 15
        },
        definition: require('../../../api/items/tools/wood-club.json'),
        type: ItemType.EQUIPMENT,
        equipment: {
            slot: EquipmentSlot.HAND,
            animation: 'swing'
        }
    },
    StoneTool: {
        icon: {file: require('../img/items/toolStoneIcon.svg')},
        graphic: {
            file: require('../img/items/toolStone.svg'),
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
        icon: {file: require('../img/items/toolBronzeIcon.svg')},
        graphic: {
            file: require('../img/items/toolBronze.svg'),
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
        icon: {file: require('../img/items/toolIronIcon.svg')},
        graphic: {
            file: require('../img/items/toolIron.svg'),
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
        icon: {file: require('../img/items/toolTitaniumIcon.svg')},
        graphic: {
            file: require('../img/items/toolTitanium.svg'),
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
        icon: {file: require('../img/items/clubStoneIcon.svg')},
        graphic: {
            file: require('../img/items/clubStone.svg'),
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
        icon: {file: require('../img/items/swordBronzeIcon.svg')},
        graphic: {
            file: require('../img/items/swordBronze.svg'),
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
        icon: {file: require('../img/items/swordIronIcon.svg')},
        graphic: {
            file: require('../img/items/swordIron.svg'),
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
        icon: {file: require('../img/items/swordTitaniumIcon.svg')},
        graphic: {
            file: require('../img/items/swordTitanium.svg'),
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
        icon: {file: require('../img/items/spearStoneIcon.svg')},
        graphic: {
            file: require('../img/items/spearStone.svg'),
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
        icon: {file: require('../img/items/spearBronzeIcon.svg')},
        graphic: {
            file: require('../img/items/spearBronze.svg'),
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
        icon: {file: require('../img/items/spearIronIcon.svg')},
        graphic: {
            file: require('../img/items/spearIron.svg'),
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
        icon: {file: require('../img/items/spearTitaniumIcon.svg')},
        graphic: {
            file: require('../img/items/spearTitanium.svg'),
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
        icon: {file: require('../img/items/hammerWoodIcon.svg')},
        graphic: {
            file: require('../img/items/hammerWood.svg'),
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
        icon: {file: require('../img/items/hammerStoneIcon.svg')},
        graphic: {
            file: require('../img/items/hammerStone.svg'),
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
        icon: {file: require('../img/items/hammerBronzeIcon.svg')},
        graphic: {
            file: require('../img/items/hammerBronze.svg'),
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
        icon: {file: require('../img/items/hammerIronIcon.svg')},
        graphic: {
            file: require('../img/items/hammerIron.svg'),
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
        icon: {file: require('../img/items/fireCampIcon.svg')},
        graphic: {
            file: require('../img/items/fireCamp.svg'),
            size: 100
        },
        definition: require('../../../api/items/placeables/campfire.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.campfire'
        }
    },
    BigCampfire: {
        icon: {file: require('../img/items/fireBigCampIcon.svg')},
        graphic: {
            file: require('../img/items/fireBigCamp.svg'),
            size: 120
        },
        definition: require('../../../api/items/placeables/big-campfire.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.campfire'
        }
    },
    Workbench: {
        icon: {file: require('../img/items/workbench.svg')},
        graphic: {
            file: require('../img/items/workbench.svg'),
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
        icon: {file: require('../img/items/workbenchConstruction.svg')},
        graphic: {
            file: require('../img/items/workbenchConstruction.svg'),
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
        icon: {file: require('../img/items/furnaceIcon.svg')},
        graphic: {
            file: require('../img/items/furnace.svg'),
            size: 180
        },
        definition: require('../../../api/items/placeables/furnace.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.furnace',
            visibleOnMinimap: true
        }
    },

    // TODO Needs an actual function
    // Seeds: {
    // 	icon: {file: require('../img/items/seedIcon.svg')},
    // 	graphic: {
    // 		file: require('../img/items/../berryBush.svg'),
    // 		size: 42
    // 	},
    // 	definition: require('../../../api/items/placeables/seeds.json'),
    // 	type: ItemType.PLACEABLE,
    // 	placeable: {
    // 		layer: 'resources.berryBush'
    // 	}
    // },

    /***********************************
     * WALLS
     ***********************************/
    WoodWall: {
        icon: {file: require('../img/items/wallWood.svg')},
        graphic: {
            file: require('../img/items/wallWood.svg'),
            size: 50
        },
        definition: require('../../../api/items/walls/wood-wall.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.walls',
            multiPlacing: true,
            directions: 4
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
    // 		directions: 4
    // 	}
    // },
    StoneWall: {
        icon: {file: require('../img/items/wallStone.svg')},
        graphic: {
            file: require('../img/items/wallStone.svg'),
            size: 50
        },
        definition: require('../../../api/items/walls/stone-wall.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.walls',
            multiPlacing: true,
            directions: false
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
    // 		directions: false
    // 	}
    // },
    BronzeWall: {
        icon: {file: require('../img/items/wallBronze.svg')},
        graphic: {
            file: require('../img/items/wallBronze.svg'),
            size: 50
        },
        definition: require('../../../api/items/walls/bronze-wall.json'),
        type: ItemType.PLACEABLE,
        placeable: {
            layer: 'placeables.walls',
            multiPlacing: true,
            directions: false
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
    // 		directions: false
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
    //         multiPlacing: true
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
    // 		multiPlacing: true
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
        icon: {file: require('../img/items/berryIcon.svg')},
        definition: require('../../../api/items/consumables/berry.json'),
        type: ItemType.CONSUMABLE
    },
    CookedMeat: {
        icon: {file: require('../img/items/meatCookedIcon.svg')},
        definition: require('../../../api/items/consumables/cooked-meat.json'),
        type: ItemType.CONSUMABLE
    },
    RawMeat: {
        icon: {file: require('../img/items/meatRawIcon.svg')},
        definition: require('../../../api/items/consumables/raw-meat.json'),
        type: ItemType.CONSUMABLE
    },
    BerryBowl: {
        icon: {file: require('../img/items/berryBowlIcon.svg')},
        definition: require('../../../api/items/consumables/berry-bowl.json'),
        type: ItemType.CONSUMABLE
    },
    Flower: {
        icon: {file: require('../img/flower.svg')},
        definition: require('../../../api/items/consumables/flower.json'),
        type: ItemType.CONSUMABLE
    },

    /***********************************
     * RESOURCES
     ***********************************/
    Wood: {
        icon: {file: require('../img/items/woodIcon.svg')},
        definition: require('../../../api/items/resources/wood.json'),
        type: ItemType.RESOURCE
    },
    Stone: {
        icon: {file: require('../img/items/stoneIcon.svg')},
        definition: require('../../../api/items/resources/stone.json'),
        type: ItemType.RESOURCE
    },
    Bronze: {
        icon: {file: require('../img/items/bronzeIcon.svg')},
        definition: require('../../../api/items/resources/bronze.json'),
        type: ItemType.RESOURCE
    },
    Iron: {
        icon: {file: require('../img/items/ironIcon.svg')},
        definition: require('../../../api/items/resources/iron.json'),
        type: ItemType.RESOURCE
    },
    Titanium: {
        icon: {file: require('../img/items/titaniumIcon.svg')},
        definition: require('../../../api/items/resources/titanium.json'),
        type: ItemType.RESOURCE
    },
    Feather: {
        icon: {file: require('../img/items/feather.svg')},
        definition: require('../../../api/items/resources/feather.json'),
        type: ItemType.RESOURCE
    },

    /***********************************
     * SPECIAL
     ***********************************/
    MysticWand: {
        icon: {file: require('../img/items/wandMysticIcon.svg')},
        graphic: {
            file: require('../img/items/wandMystic.svg'),
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
