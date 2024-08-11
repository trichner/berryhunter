import {Container, Graphics, Texture} from 'pixi.js';
import {createInjectedSVG} from '../InjectedSVG';
import {BasicConfig as Constants} from '../../config/BasicConfig';
import {Vector} from '../Vector';
import {isDefined, isUndefined, nearlyEqual, TwoDimensional} from '../Utils';
import {StatusEffect, StatusEffectDefinition} from './StatusEffect';
import {radians} from "../interfaces/Types";
import {PrerenderEvent} from "../Events";

let movementInterpolatedObjects = new Set();
let rotatingObjects = new Set();

export class GameObject {
    readonly id: number; // will be filled in GameMapWithBackend with backend ids

    layer: Container;
    size: number = Constants.GRAPHIC_BASE_SIZE / 2;
    rotation: number = 0;
    turnRate: number = Constants.DEFAULT_TURN_RATE;
    isMovable: boolean = false;
    rotateOnPositioning: boolean = false;
    visibleOnMinimap: boolean = true;
    shape: Container;
    statusEffects: { [key: string]: StatusEffect };
    activeStatusEffect: StatusEffect = null;

    desiredPosition: Vector;
    desireTimestamp: number;

    desiredRotation: number;
    desiredRotationTimestamp: number;

    /**
     * Set by MiniMap if this is a tracked (= movable) GameObject
     */
    minimapIcon: Container;

    constructor(id: number, gameLayer: Container, x: number, y: number, size: number, rotation: number, svg: Texture) {
        this.id = id;
        this.layer = gameLayer;
        this.size = size;
        this.rotation = rotation;

        this.shape = this.initShape(svg, x, y, size, rotation);
        this.statusEffects = this.createStatusEffects();
        this.show();
    }

    static setup() {
        if (Constants.MOVEMENT_INTERPOLATION) {
            PrerenderEvent.subscribe(moveInterpolatedObjects);
        }
        if (Constants.LIMIT_TURN_RATE) {
            PrerenderEvent.subscribe(applyTurnRate);
        }
    };

    initShape(svg: Texture, x: number, y: number, size: number, rotation: number): Container {
        if (svg) {
            return createInjectedSVG(svg, x, y, size, rotation);
        } else {
            return this.createShape(x, y, size, rotation);
        }
    }

    protected createStatusEffects() {
        // Default NOP
        return {};
    }

    /**
     * Fallback method if there is no SVG bound to this gameObject class.
     */
    createShape(x: number, y: number, size: number, rotation: number): Graphics {
        throw 'createShape not implemented for ' + this.constructor.name;
    }

    createMinimapIcon(): Container {
        throw 'createMinimapIcon not implemented for ' + this.constructor.name;
    }

    setPosition(x: number, y: number) {
        if (isUndefined(x)) {
            throw "x has to be defined.";
        }
        if (isUndefined(y)) {
            throw "y has to be defined.";
        }

        if (isDefined(this.desiredPosition) && //
            nearlyEqual(this.desiredPosition.x, x, 0.01) && //
            nearlyEqual(this.desiredPosition.y, y, 0.01)) {
            return false;
        }

        if (this.rotateOnPositioning) {
            this.setRotation(TwoDimensional.angleBetween(this.getX(), this.getY(), x, y));
        }

        if (Constants.MOVEMENT_INTERPOLATION) {
            this.desiredPosition = new Vector(x, y); //.sub(this.shape.position);
            this.desireTimestamp = performance.now();
            movementInterpolatedObjects.add(this);
        } else {
            this.shape.position.set(x, y);
        }

        return true;
    }

    movePosition(deltaX, deltaY?) {
        if (arguments.length === 1) {
            // Seems to be a vector
            deltaY = deltaX.y;
            deltaX = deltaX.x;
        }

        this.setPosition(
            this.getX() + deltaX,
            this.getY() + deltaY
        );
    }

    getPosition() {
        // Defensive copy
        // FIXME necessary?
        return Vector.clone(this.shape.position);
    }

    getX() {
        return this.getPosition().x;
    }

    getY() {
        return this.getPosition().y;
    }

    setRotation(rotation: radians) {
        if (isUndefined(rotation)) {
            return;
        }

        rotation %= 2 * Math.PI;

        if (Constants.LIMIT_TURN_RATE && this.turnRate > 0) {
            this.desiredRotation = rotation;
            this.desiredRotationTimestamp = performance.now();
            rotatingObjects.add(this);
        } else {
            this.getRotationShape().rotation = rotation;
        }
    }

    getRotation() {
        return this.getRotationShape().rotation;
    }

    getRotationShape(): Container {
        return this.shape;
    }

    show() {
        this.layer.addChild(this.shape);
    }

    hide() {
        this.layer.removeChild(this.shape);
    }

    updateStatusEffects(newStatusEffects: StatusEffectDefinition[]) {
        if (!Array.isArray(newStatusEffects) || newStatusEffects.length === 0) {
            this.hideActiveStatusEffect();
        } else {
            newStatusEffects = StatusEffect.sortByPriority(newStatusEffects);
            // Get the first (=highest priority) status effect that's supported by this GameObject
            let newStatusEffect = newStatusEffects.find(
                newStatusEffect => this.statusEffects.hasOwnProperty(newStatusEffect.id)
            );
            if (isDefined(newStatusEffect)) {
                if (this.activeStatusEffect === null) {
                    // No effect running, run one
                    this.showStatusEffect(newStatusEffect.id);
                } else if (this.activeStatusEffect.id !== newStatusEffect.id) {
                    this.activeStatusEffect.forceHide();
                    this.showStatusEffect(newStatusEffect.id);
                }
            } else {
                this.hideActiveStatusEffect();
            }
        }
    }

    private hideActiveStatusEffect() {
        if (this.activeStatusEffect !== null) {
            this.activeStatusEffect.hide();
            this.activeStatusEffect = null;
        }
    }

    private showStatusEffect(statusEffectid: string) {
        this.activeStatusEffect = this.statusEffects[statusEffectid];
        this.activeStatusEffect.show();
    }
}


function moveInterpolatedObjects() {
    let now = performance.now();

    movementInterpolatedObjects.forEach(
        /**
         *
         * @param {GameObject} gameObject
         */
        function (gameObject: GameObject) {
            let elapsedTimePortion = (now - gameObject.desireTimestamp) / Constants.SERVER_TICKRATE;
            if (elapsedTimePortion >= 1) {
                gameObject.shape.position.copyFrom(gameObject.desiredPosition);
                movementInterpolatedObjects.delete(gameObject);
            } else {
                gameObject.shape.position.copyFrom(
                    Vector.clone(gameObject.shape.position).lerp(
                        gameObject.desiredPosition,
                        elapsedTimePortion));
            }
        });
}

function applyTurnRate() {
    let now = performance.now();

    rotatingObjects.forEach(
        /**
         *
         * @param {GameObject} gameObject
         */
        function (gameObject: GameObject) {
            let elapsedTime = now - gameObject.desiredRotationTimestamp;
            let rotationDifference = elapsedTime * gameObject.turnRate;
            let rotationShape = gameObject.getRotationShape();
            let currentRotation = rotationShape.rotation;
            let desiredRotation = gameObject.desiredRotation;
            // Choose direction of turning by applying a sign to rotationDifference
            if (currentRotation < desiredRotation) {
                if (Math.abs(currentRotation - desiredRotation) >= Math.PI) {
                    rotationDifference = -rotationDifference;
                }
            } else {
                if (Math.abs(currentRotation - desiredRotation) < Math.PI) {
                    rotationDifference = -rotationDifference;
                }
            }

            if ((rotationDifference >= 0 && currentRotation + rotationDifference >= desiredRotation) ||
                (rotationDifference < 0 && currentRotation + rotationDifference <= desiredRotation)) {
                rotationShape.rotation = desiredRotation;
                rotatingObjects.delete(gameObject);
            } else {
                rotationShape.rotation += rotationDifference;
            }

            gameObject.desiredRotationTimestamp = now;
        });
}
