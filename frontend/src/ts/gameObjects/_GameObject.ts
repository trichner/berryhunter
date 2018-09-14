'use strict';

import * as _ from 'lodash';
import {InjectedSVG} from '../InjectedSVG';
import {BasicConfig as Constants} from '../../config/Basic';
import {Vector} from '../Vector';
import {isDefined, isUndefined, nearlyEqual, TwoDimensional} from '../Utils';
import {StatusEffect} from './StatusEffect';


let movementInterpolatedObjects = new Set();
let rotatingObjects = new Set();

export class GameObject {
    id: number; // will be filled in GameMapWithBackend with backend ids

    layer;
    size: number = Constants.GRAPHIC_BASE_SIZE / 2;
    rotation: number = 0;
    turnRate: number = Constants.DEFAULT_TURN_RATE;
    isMoveable: boolean = false;
    rotateOnPositioning: boolean = false;
    visibleOnMinimap: boolean = true;
    shape;
    statusEffects;
    activeStatusEffect = null;

    desiredPosition: Vector;
    desireTimestamp;

    desiredRotation: number;
    desiredRotationTimestamp;

    constructor(gameLayer, x, y, size, rotation, svg) {
        this.layer = gameLayer;
        this.size = size;
        this.rotation = rotation;

        const args = Array.prototype.splice.call(arguments, 5);
        this.shape = this.initShape.apply(this, [svg, x, y, size, rotation].concat(args));
        this.statusEffects = this.createStatusEffects();
        for (let statusEffect in this.statusEffects) {
            this.statusEffects[statusEffect].id = statusEffect;
        }
        this.show();
    }

    static setup = function (game) {
        if (Constants.MOVEMENT_INTERPOLATION) {
            game.renderer.on('prerender', moveInterpolatedObjects);
        }
        if (Constants.LIMIT_TURN_RATE) {
            game.renderer.on('prerender', applyTurnRate);
        }
    };


    initShape(svg, x, y, size, rotation) {
        if (svg) {
            return new InjectedSVG(svg, x, y, this.size, this.rotation);
        } else {
            const args = Array.prototype.splice.call(arguments, 2);
            return this.createShape.apply(this, [x, y].concat(args));
        }
    }

    createStatusEffects() {
        // Default NOP
        return {};
    }

    /**
     * Fallback method if there is no SVG bound to this gameObject class.
     * @param x
     * @param y
     */
    createShape(x, y) {
        console.error('createShape not implemented for ' + this.constructor.name);
    }

    createMinimapIcon() {
        console.error('createMinimapIcon not implemented for ' + this.constructor.name);
    }

    setPosition(x, y) {
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

    setRotation(rotation) {
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

    getRotationShape() {
        return this.shape;
    }

    show() {
        this.layer.addChild(this.shape);
    }

    hide() {
        this.layer.removeChild(this.shape);
    }

    updateStatusEffects(newStatusEffects) {
        if (!_.isArray(newStatusEffects) || newStatusEffects.length === 0) {
            if (this.activeStatusEffect !== null) {
                this.activeStatusEffect.hide();
                this.activeStatusEffect = null;
            }
        } else {
            newStatusEffects = StatusEffect.sortByPriority(newStatusEffects);
            let newStatusEffect = newStatusEffects.find(function (newStatusEffect) {
                return this.statusEffects.hasOwnProperty(newStatusEffect.id);
            }, this);
            if (isDefined(newStatusEffect)) {
                if (this.activeStatusEffect === null) {
                    // No effect running, run one
                    this.activeStatusEffect = this.statusEffects[newStatusEffect.id];
                    this.activeStatusEffect.show();
                } else if (this.activeStatusEffect.id !== newStatusEffect.id) {
                    this.activeStatusEffect.forceHide();
                    this.activeStatusEffect = this.statusEffects[newStatusEffect.id];
                    this.activeStatusEffect.show();
                }
            } else {
                if (this.activeStatusEffect !== null) {
                    this.activeStatusEffect.hide();
                    this.activeStatusEffect = null;
                }
            }
        }
    }
}


function moveInterpolatedObjects() {
    let now = performance.now();

    movementInterpolatedObjects.forEach(
        /**
         *
         * @param {GameObject} gameObject
         */
        function (gameObject) {
            let elapsedTimePortion = (now - gameObject.desireTimestamp) / Constants.SERVER_TICKRATE;
            if (elapsedTimePortion >= 1) {
                gameObject.shape.position.copy(gameObject.desiredPosition);
                movementInterpolatedObjects.delete(gameObject);
            } else {
                gameObject.shape.position.copy(
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
        function (gameObject) {
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
