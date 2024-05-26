import _debounce = require('lodash/debounce');
import {Vehicle} from './natureOfCode/arrive/vehicle';
import {Vector} from './Vector';
import {IGame} from "./interfaces/IGame";
import {Develop} from "./develop/_Develop";
import {CameraUpdatedEvent, ISubscriptionToken, PrerenderEvent} from "./Events";
import {ICharacterLike} from "./interfaces/ICharacter";

let Game: IGame = null;

let Corners = [];
let extraBoundary: number;

export class Camera {
    character: ICharacterLike;
    vehicle: Vehicle;
    position: Vector;
    private prerenderSubToken: ISubscriptionToken;

    /**
     * @param character the character to follow
     */
    constructor(character: ICharacterLike) {
        this.character = character;

        this.vehicle = new Vehicle(
            character.getX(),
            character.getY());

        this.vehicle.setMaxSpeed(character.movementSpeed * 2);

        this.position = this.vehicle.position;

        this.prerenderSubToken = PrerenderEvent.subscribe(this.update, this);
    }

    static setup(game: IGame) {
        Game = game;

        extraBoundary = Math.min(Game.width, Game.height) / 2;

        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                Corners.push({x: x * Game.width / 2, y: y * Game.height / 2});
            }
        }
    };

    getScreenX(mapX: number): number {
        return mapX - this.getX() + Game.centerX;
    }

    getScreenY(mapY: number): number {
        return mapY - this.getY() + Game.centerY;
    }

    getMapX(screenX: number): number {
        return screenX + this.getX() - Game.centerX;
    }

    getMapY(screenY: number): number {
        return screenY + this.getY() - Game.centerY;
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
        position.add(new Vector(Game.centerX, Game.centerY));
        Game.cameraGroup.position.copyFrom(position);

        CameraUpdatedEvent.trigger(position);
    }

    destroy() {
        this.prerenderSubToken.unsubscribe();
    }
}

function keepWithinMapBoundaries(vehicle: Vehicle) {
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
