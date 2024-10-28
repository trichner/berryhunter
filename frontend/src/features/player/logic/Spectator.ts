import {Vector} from '../../core/logic/Vector';
import {Camera} from '../../camera/logic/Camera';
import {IGame} from "../../../old-structure/interfaces/IGame";
import {ICharacterLike} from "../../../old-structure/interfaces/ICharacter";

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
