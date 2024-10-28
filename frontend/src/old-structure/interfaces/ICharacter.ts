import {Vector} from "../../features/core/logic/Vector";

export interface ICharacterLike {
    getX: () => number;
    getY: () => number;
    getPosition: () => Vector;
    movementSpeed: number;
}
