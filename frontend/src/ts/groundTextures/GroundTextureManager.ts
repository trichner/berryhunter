'use strict';

import {isDefined} from '../Utils';
import {GroundTexture, Parameters} from './GroundTexture';
import {GroundTextureTypes} from './GroundTextureTypes';
import {IGame} from "../interfaces/IGame";


const textures = [];
let renderingStarted = false;
let latestTextureIndex;
let terrainTexturesLayer: PIXI.Container;

export function setup(game: IGame) {
    terrainTexturesLayer = game.layers.terrain.textures;
    textures.forEach((texture: GroundTexture) => {
        texture.addToMap(terrainTexturesLayer);
    });

    renderingStarted = true;
}

export function placeTexture(parameters: Parameters) {
    let newTexture = new GroundTexture(parameters);
    if (parameters.stacking === 'bottom') {
        textures.unshift(newTexture);
        latestTextureIndex = 0;
    } else {
        latestTextureIndex = textures.push(newTexture) - 1;
    }

    if (renderingStarted) {
        newTexture.addToMap(terrainTexturesLayer);
    }
}

export function removeLatestTexture() {
    if (isDefined(latestTextureIndex)) {
        let texture = textures[latestTextureIndex];
        textures.splice(latestTextureIndex, 1);
        if (renderingStarted) {
            texture.remove();
        }
        latestTextureIndex = undefined;
    }
}

export function getTexturesAsJSON() {
    return JSON.stringify(textures.map(function (texture) {
        let params = texture.parameters;
        return {
            type: params.type.name,
            x: params.x,
            y: params.y,
            size: params.size,
            rotation: Math.round(params.rotation * 1000) / 1000, // Round to 3 digits
            flipped: params.flipped,
        }
    }), null, 2);
}

export function getTextureCount() {
    return textures.length;
}

const groundTextures = require('../../config/groundTextures.json');

groundTextures.forEach(function (groundTexture) {
    groundTexture.type = GroundTextureTypes[groundTexture.type];
    placeTexture(groundTexture);
});
