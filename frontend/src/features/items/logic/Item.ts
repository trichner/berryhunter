import {EquipmentSlot} from "./Equipment";

export interface ItemConfig {
    icon: {
        file: string, // SVG
    },
    graphic: {
        file: string, // SVG
        size: number,
        offsetX: number,
        offsetY: number,
    },
    definition: ItemDefinition,
    type: ItemType,
    equipment: {
        slot: EquipmentSlot,
        animation: ('stab' | 'swing')
    },
    placeable?: {
        layer: string,
        multiPlacing?: boolean,
        visibleOnMinimap?: boolean,
        directions?: false | 4 | 8,
    }
}

export interface ItemDefinition {
    name:     string;
    id:       number;
    type?:    ItemType;
    factors?: { [key: string]: number };
    recipe?:  Recipe;
    body?:    ItemBody;
}

export interface ItemBody {
    radius?:    number;
    solid:      boolean;
    minRadius?: number;
    maxRadius?: number;
}

export interface Recipe {
    craftTimeInSeconds: number;
    materials:          Material[];
    tools?:             string[];
}

export interface Material {
    item:  string;
    count: number;
}

export enum ItemType {
    Consumable = "CONSUMABLE",
    Equipment = "EQUIPMENT",
    Placeable = "PLACEABLE",
    Resource = "RESOURCE",
}
