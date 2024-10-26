import {GraphicsConfig} from "../../../frontend/src/client-data/Graphics";

export const animals = [
    {
        graphic: GraphicsConfig.mobs.dodo.file,
        definition: require('../../../api/mobs/dodo.json'),
    }, {
        graphic: GraphicsConfig.mobs.mammoth.file,
        definition: require('../../../api/mobs/mammoth.json'),
    }, {
        graphic: GraphicsConfig.mobs.saberToothCat.file,
        definition: require('../../../api/mobs/saber-tooth-cat.json'),
    }
];
