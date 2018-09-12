'use strict';

import {Vector} from './Vector';
import {Camera} from './Camera';

export class Spectator {
    position: Vector;
    movementSpeed: number;
    camera: Camera;

    constructor(game, x, y) {
        this.position = new Vector(x, y);
        this.movementSpeed = Math.max(game.width, game.height);
        this.camera = new Camera(this);
    }

    getPosition() {
        return this.position;
    }

    getX() {
        return this.position.x;
    }

    getY() {
        return this.position.y;
    }

    remove() {
        this.camera.destroy();
    }
}