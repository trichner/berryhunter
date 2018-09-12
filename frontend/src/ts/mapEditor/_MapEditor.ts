'use strict';

/**
 * FIXME this class hasn't been updated for quite a while
 */

import {getUrlParameter, isDefined} from '../Utils';
import {BasicConfig as Constants} from '../../config/Basic';
import QuadrantGrid from '../mapEditor/QuadrantGrid';
import * as Preloading from '../Preloading';
import {Quadrants} from './Quadrants';
import * as Mobs from '../gameObjects/Mobs';
import * as Resources from '../gameObjects/Resources';
import * as Develop from '../develop/_Develop';
import * as Game from '../Game';
import * as _ from 'lodash';
import * as PIXI from 'pixi.js';


export function isActive() {
    if (typeof this.active !== 'undefined') {
        return this.active;
    }

    let quadrantParameter = getUrlParameter(Constants.MODE_PARAMETERS.MAP_EDITOR);
    this.active = isDefined(quadrantParameter);
    return this.active;
}

export function setup() {
    let renderer = PIXI.autoDetectRenderer(
        QuadrantGrid.QUADRANT_SIZE,
        QuadrantGrid.QUADRANT_SIZE
    );

    document.getElementById('drawingContainer').appendChild(renderer.view);

    if (Develop.isActive()) {
        Develop.logWebsocketStatus('Disabled', 'neutral');
    }

    // Empty quadrants
    // Quadrants = [[]]; // FIXME
    this.calculateMapDimensions();

    // FIXME
    // GameMapGenerator.generate = GameMapGenerator.generateFromQuadrants;

    document.getElementById('quadrantJson').addEventListener('input', this.tryRenderQuadrants);
    document.getElementById('renderButton').addEventListener('click', this.tryRenderQuadrants);

    _.extend(window, Mobs);
    _.extend(window, Resources);

    return renderer;
}

export function afterSetup() {
    Game.pause();

    Game.createPlayer(0, Game.width / 2, Game.height / 2, 'Map Architect');

    this.grid = new QuadrantGrid(Game.width, Game.height);

    // TODO Events.on('camera.update')
    Game.player.camera.onUpdate = function (position) {
        this.grid.cameraUpdate(position);
    }.bind(this);

    this.tryRenderQuadrants();
}

export function tryRenderQuadrants() {
    let jsonStatus = document.getElementById('jsonStatus');
    jsonStatus.classList.remove('error');
    jsonStatus.classList.remove('success');

    if (!this.value) {
        jsonStatus.innerHTML = 'Waiting for input...';
    }

    try {
        // FIXME
        // Quadrants = eval(document.getElementById('quadrantJson').value);

    } catch (e) {
        jsonStatus.classList.add('error');
        jsonStatus.innerHTML = "Error in JSON: " + e.message;
        return;
    }

    if (!Quadrants) {
        jsonStatus.classList.add('error');
        jsonStatus.innerHTML = "The JSON doesn't return a definition.";
    }

    calculateMapDimensions();

    // FIXME use Pixi etc.
    // Game.layers.mapBorders.remove();
    // Game.layers.mapBorders = Game.two.makeGroup();
    // Game.layers.gameObjects.remove();
    // Game.layers.gameObjects = Game.two.makeGroup();

    // Re-add overlay to ensure z-index
    // FIXME ???
    // Game.two.add(Game.layers.overlay.remove());

    try {
        // FIXME
        // Game.map = new GameMap();
    } catch (e) {
        jsonStatus.classList.add('error');
        jsonStatus.innerHTML = "Error in Quadrant Definition: " + e.message;
        return;
    }

    Game.miniMap.clear();

    // FIXME
    // MapEditor.grid = new QuadrantGrid(MapEditor.mapWidth, MapEditor.mapHeight);

    Game.render();
    jsonStatus.innerHTML = 'Rendered';
    jsonStatus.classList.add('success');
}

export function calculateMapDimensions() {
    // If there's no quadrant, at least render 1 empty quadrant
    let quadrantCount = Math.max(1, Quadrants.length);
    // TODO Quadranten möglichst quadratisch auslegen, statt alle in die Breite
    this.mapWidth = QuadrantGrid.QUADRANT_SIZE * quadrantCount;
    this.mapHeight = QuadrantGrid.QUADRANT_SIZE;
}

export function getMapDimensions() {
    return {
        width: this.mapWidth,
        height: this.mapHeight,
    }
};


if (isActive()) {
    Preloading.registerPartial('partials/mapEditor.html');

    // TODO onAction
    // let placeableGameobject = new Placeable(
    // 	placedItem,
    // 	this.character.getX() + Math.cos(this.character.getRotation()) * Constants.PLACEMENT_RANGE,
    // 	this.character.getY() + Math.sin(this.character.getRotation()) * Constants.PLACEMENT_RANGE,
    // );
    // Game.map.objects.push(placeableGameobject);
    // Game.player.inventory.removeItem(placedItem, 1);
}

