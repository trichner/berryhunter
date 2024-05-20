import {Vector} from "../Vector";

export interface ICharacterLike {
    getX: () => number;
    getY: () => number;
    getPosition: () => Vector;
    movementSpeed: number;
}
