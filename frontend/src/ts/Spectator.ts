'use strict';

import * as Game from './Game';
import {Vector} from './Vector';
import {Camera} from './Camera';

export class Spectator {
    position: Vector;
    movementSpeed: number;
    camera: Camera;

    constructor(x, y) {
        this.position = new Vector(x, y);
        this.movementSpeed = Math.max(Game.width, Game.height);
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