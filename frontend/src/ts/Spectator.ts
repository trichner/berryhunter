import {Vector} from './Vector';
import {Camera} from './Camera';
import {IGame} from "./interfaces/IGame";
import {ICharacterLike} from "./interfaces/ICharacter";

export class Spectator implements ICharacterLike {
    position: Vector;
    movementSpeed: number;
    camera: Camera;

    constructor(game: IGame, x: number, y: number) {
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
