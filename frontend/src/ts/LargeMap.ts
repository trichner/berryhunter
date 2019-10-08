'use strict';

import * as PIXI from 'pixi.js';
import * as UserInterface from './userInterface/UserInterface';
import {KeyCodes} from './input/keyboard/keys/KeyCodes';
import * as Events from "./Events";
import {GAME_DEATH, GAME_SETUP} from "./Events";
import {deg2rad, isDefined} from "./Utils";

let Game = null;
Events.on(GAME_SETUP, game => {
    Game = game;
});

export class LargeMap {
    mapWidth;
    mapHeight;
    registeredGameObjectIds;
    trackedGameObjects;
    width;
    height;
    renderer;
    stage: PIXI.Container;
    iconGroup: PIXI.Container;
    playerGroup: PIXI.Container;
    scale: number;
    iconSizeFactor: number;
    paused: boolean;
    playing: boolean;
    domElement: HTMLElement;

    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        /**
         * All game objects added to the miniMap.
         */
        this.registeredGameObjectIds = [];

        /**
         * Moveable game objects those miniMap position will be updated continuously.
         */
        this.trackedGameObjects = [];

        let container = UserInterface.getLargeMapContainer();

        this.height = container.clientHeight;
        // height will be read out from HTML and also used for width to create a circle in a square
        // noinspection JSSuspiciousNameCombination
        this.width = this.height;

        this.renderer = PIXI.autoDetectRenderer({
            width: this.width,
            height: this.height,
            transparent: true
        });
        container.appendChild(this.renderer.view);
        this.stage = new PIXI.Container();

        this.iconGroup = new PIXI.Container();
        this.stage.addChild(this.iconGroup);
        this.iconGroup.position.set(
            this.width / 2,
            this.height / 2
        );

        this.playerGroup = new PIXI.Container();
        this.stage.addChild(this.playerGroup);
        this.playerGroup.position.set(
            this.width / 2,
            this.height / 2
        );

        const sizeFactorRelatedToMapSize = 1;
        this.scale = this.width / this.mapWidth;
        this.iconSizeFactor = this.scale * sizeFactorRelatedToMapSize;

        this.domElement = document.getElementById("largeMap");

        this.renderer.on('prerender', update.bind(this));
    }

    start() {
        this.play();
    }

    stop() {
        this.pause();
    }

    loop() {
        if (this.paused) {
            return;
        }

        requestAnimationFrame(this.loop.bind(this));

        this.renderer.render(this.stage);
    }

    play() {
        this.playing = true;
        this.paused = false;
        this.loop();
    }

    pause() {
        this.playing = false;
        this.paused = true;
    }

    toggleVisibility(visible?: boolean) {
        let force = isDefined(visible)? !visible : undefined;
        this.domElement.classList.toggle('hidden', force);
    }

    /**
     * Adds the icon of the object to the map.
     * @param gameObject
     */
    add(gameObject) {
        if (this.registeredGameObjectIds.indexOf(gameObject.id) !== -1) {
            // The object is already on the miniMap
            return;
        }
        this.registeredGameObjectIds.push(gameObject.id);

        const largeMapIcon = gameObject.createLargeMapIcon();
        if (gameObject.constructor.name === 'Character') {
            this.playerGroup.addChild(largeMapIcon);
        } else {
            this.iconGroup.addChild(largeMapIcon);
        }

        // Position each icon relative to its position on the real map.
        let x = gameObject.getX() * this.scale;
        let y = gameObject.getY() * this.scale;
        largeMapIcon.position.set(x, y);
        largeMapIcon.scale.set(largeMapIcon.scale.x * this.iconSizeFactor);

        if (gameObject.isMoveable) {
            gameObject.largeMapIcon = largeMapIcon;
            this.trackedGameObjects.push(gameObject);
        }
        return largeMapIcon;
    }

    clear() {
        this.registeredGameObjectIds.length = 0;
        this.trackedGameObjects.length = 0;
        this.playerGroup.removeChildren();
        this.iconGroup.removeChildren();
    }

}

function update() {
    this.trackedGameObjects.forEach(gameObject => {
        // TODO Rotation des largeMapIcons anpassen
        gameObject.largeMapIcon.position.x = gameObject.getX() * this.scale;
        gameObject.largeMapIcon.position.y = gameObject.getY() * this.scale;
        // TODO only works for character
        gameObject.largeMapIcon.rotation = gameObject.getRotation() + deg2rad(90);
    });
}

Events.on(GAME_DEATH, game => {
    game.largeMap.toggleVisibility(false);
});

window.addEventListener('keydown', function (event) {
    if (Game.state !== Game.States.PLAYING) {
        return;
    }
    if (event.keyCode === KeyCodes.M) {
        Game.largeMap.toggleVisibility();
    }
});
