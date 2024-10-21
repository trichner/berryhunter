import {isDefined} from '../Utils';
import {GroundTexture, Parameters} from './GroundTexture';
import {groundTextureTypes} from './GroundTextureTypes';
import {IGame} from "../interfaces/IGame";
import { Container } from 'pixi.js';


const textures: GroundTexture[] = [];
let renderingStarted = false;
let latestTextureIndex: number;
let terrainTexturesLayer: Container;

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

interface GroundTextureDefinition {
    type: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
    flipped: 'none' | 'horizontal' | 'vertical';
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
        };
    }), null, 2);
}

export function getTextureCount() {
    return textures.length;
}

const groundTextures = require('../../config/groundTextures.json');

groundTextures.forEach(function (groundTexture: GroundTextureDefinition) {
    // Migration to move certain textures towards center
    // if (groundTexture.type === 'Sand') {
    //     const units = 240;
    //     const { x, y } = groundTexture;
    //     const distance = Math.sqrt(x * x + y * y);
    //
    //     // Calculate the new distance
    //     const newDistance = distance - units;
    //     const scale = newDistance / distance;
    //
    //     // Update the coordinates based on the scale
    //     const newX = x * scale;
    //     const newY = y * scale;
    //
    //     groundTexture.x = Math.round(newX);
    //     groundTexture.y = Math.round(newY);
    // }

    placeTexture({
        type: groundTextureTypes[groundTexture.type],
        x: groundTexture.x,
        y: groundTexture.y,
        size: groundTexture.size,
        rotation: groundTexture.rotation,
        flipped: groundTexture.flipped,
        stacking: 'top'
    });
});
