import {GraphicsConfig} from "../../../frontend/src/client-data/Graphics";
import {ItemsConfig} from "../../../frontend/src/client-data/Items";

const resourceCfg = GraphicsConfig.resources;

// generator.weight is defined berryhunterd/gen/generator.go:62 ff.
export const resources = [
    {
        name: "Trees",
        graphics: [
            resourceCfg.tree.roundTreeFile,
            resourceCfg.tree.deciduousTreeFile,
        ],
        produces: ItemsConfig.Wood,
        generator: {weight: 80}
    }, {
        name: "Berry Bush",
        graphics: [resourceCfg.berryBush.bushFile],
        produces: ItemsConfig.Berry,
        generator: {weight: 6}
    }, {
        name: "Stone",
        graphics: [resourceCfg.mineral.stoneFile],
        produces: ItemsConfig.Stone,
        generator: {weight: 20}
    }, {
        name: "Bronze",
        graphics: [resourceCfg.mineral.bronzeFile],
        produces: ItemsConfig.Bronze,
        generator: {weight: 10}
    }, {
        name: "Iron",
        graphics: [resourceCfg.mineral.ironFile],
        produces: ItemsConfig.Iron,
        generator: {weight: 4}
    }, {
        name: "Titanium",
        graphics: [resourceCfg.mineral.titaniumFile],
        produces: ItemsConfig.Titanium,
        generator: {weight: 2}
    }, {
        name: "Flower",
        graphics: [resourceCfg.flower.file],
        produces: ItemsConfig.Flower,
        generator: {weight: 18}
    }
];
