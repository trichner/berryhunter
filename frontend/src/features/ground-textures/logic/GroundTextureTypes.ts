import * as Preloading from '../../core/logic/Preloading';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {degrees} from "../../common/logic/Types";
import { Texture } from 'pixi.js';
import * as PIXI from 'pixi.js';
import {ISvgContainer} from "../../core/logic/ISvgContainer";

const GroundTextureTypes = GraphicsConfig.groundTextureTypes;

export interface GroundTextureType {
    name: string;
    displayName: string;
    svg: Texture;
    file: string,
    minSize: number,
    maxSize: number,
    rotation: degrees;
    flipVertical: boolean;
    flipHorizontal: boolean;
}

// Validate
let hasError = false;
for (let type in GroundTextureTypes) {
    let groundTextureType: Partial<GroundTextureType> = GroundTextureTypes[type];
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
        Preloading.registerGameObjectSVG(groundTextureType as ISvgContainer, groundTextureType.file, groundTextureType.maxSize);
    }
}

if (hasError) {
    throw "There are erroneous GroundTextureType(s).";
}

export const groundTextureTypes = GroundTextureTypes as unknown as {[key: string]: GroundTextureType};
