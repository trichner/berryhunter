'use strict';

import {Vehicle} from './natureOfCode/arrive/vehicle';
import {Vector} from './Vector';
import {Character} from './gameObjects/Character';
import {IGame} from "./interfaces/IGame";
import {Develop} from "./develop/_Develop";
import {CameraUpdatedEvent, PrerenderEvent} from "./Events";

let Game: IGame = null;

let Corners = [];
let extraBoundary;

export class Camera {
    character: Character;
    offset: Vector;
    vehicle: Vehicle;
    position: Vector;

    /**
     *
     * @param {Character} character the Character to follow
     */
    constructor(character) {
        this.character = character;

        this.offset = new Vector(Game.centerX, Game.centerY);
        this.vehicle = new Vehicle(
            character.getX(),
            character.getY());

        this.vehicle.setMaxSpeed(character.movementSpeed * 2);

        /**
         * @type {Vector}
         */
        this.position = this.vehicle.position;

        PrerenderEvent.subscribe(this.update, this);
    }

    static setup(game) {
        Game = game;

        extraBoundary = Math.min(Game.width, Game.height) / 2;

        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                Corners.push({x: x * Game.width / 2, y: y * Game.height / 2});
            }
        }
    };

    getScreenX(mapX) {
        return mapX - this.getX() + this.offset.x;
    }

    getScreenY(mapY) {
        return mapY - this.getY() + this.offset.y;
    }

    getMapX(screenX) {
        return screenX + this.getX() - this.offset.x;
    }

    getMapY(screenY) {
        return screenY + this.getY() - this.offset.y;
    }

    getX() {
        return this.position.x;
    }

    getY() {
        return this.position.y;
    }

    update() {
        this.vehicle.arrive(this.character.getPosition());
        this.vehicle.update();

        if (!Develop.isActive() ||
            (Develop.isActive() && Develop.get().settings.cameraBoundaries)) {
            keepWithinMapBoundaries(this.vehicle);
        }

        let position = Vector.clone(this.position);
        position.negate();
        position.add(this.offset);
        Game.cameraGroup.position.copy(position);

        CameraUpdatedEvent.trigger(position);
    }

    destroy() {
        PrerenderEvent.unsubscribe(this.update);
    }
}

function keepWithinMapBoundaries(vehicle) {
    let corners = Corners.map(function (corner) {
        return vehicle.position.clone().add(corner);
    });

    let r = new Vector();
    corners.forEach(function (corner) {
        let length = corner.length();
        let d = length - extraBoundary - Game.map.radius;
        if (d < 0) {
            return;
        }

        corner.divideScalar(length).multiplyScalar(-d);

        r.add(corner);
    });

    vehicle.position.add(r);
}
