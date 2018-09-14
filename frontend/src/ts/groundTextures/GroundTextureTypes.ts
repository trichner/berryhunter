'use strict';

import * as Preloading from '../Preloading';
import {GraphicsConfig} from '../../config/Graphics';

const GroundTextureTypes = GraphicsConfig.groundTextureTypes;

// Validate
let hasError = false;
for (let type in GroundTextureTypes) {
    let groundTextureType = GroundTextureTypes[type];
    groundTextureType.name = type;

    if (!groundTextureType.hasOwnProperty('file')) {
        console.error("GroundTextureType '" + type +
            "' needs field 'file' with the file name " +
            "for the texture graphic.");
        hasError = true;
    }
    if (!groundTextureType.hasOwnProperty('minSize')) {
        console.error("GroundTextureType '" + type +
            "' needs field 'minSize' which determines " +
            "the minimal random size in the panel.");
        hasError = true;
    }
    if (!groundTextureType.hasOwnProperty('maxSize')) {
        console.error("GroundTextureType '" + type +
            "' needs field 'maxSize' which determines " +
            "the minimal random size in the panel.");
        hasError = true;
    }

    /*
     * Type is valid - preload the texture graphic
     */
    if (!hasError) {
        Preloading.registerGameObjectSVG(groundTextureType, groundTextureType.file, groundTextureType.maxSize);
    }
}

if (hasError) {
    throw "There are erroneous GroundTextureType(s).";
}