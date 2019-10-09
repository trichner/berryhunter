'use strict';

import _clone = require('lodash/clone');
import {isDefined, removeElement} from '../Utils';
import {DebugCircle} from '../develop/DebugCircle';
import {GameObject} from '../gameObjects/_GameObject';
import {Character} from '../gameObjects/Character';
import {Placeable} from '../gameObjects/Placeable';
import {Resource} from '../gameObjects/Resources';
import * as Equipment from '../items/Equipment';
import {EquipmentSlot} from '../items/Equipment';
import {BerryhunterApi} from './BerryhunterApi';
import {Layer} from "../MiniMap";
import {IGame} from "../interfaces/IGame";
import {Develop} from "../develop/_Develop";

let Game: IGame = null;

export class GameMapWithBackend {
    radius: number;
    width: number;
    height: number;

    objects = {};

    constructor(game, radius: number) {
        Game = game;
        this.radius = radius;
        this.width = 2 * radius;
        this.height = 2 * radius;
    }

    /**
     * @param entityId
     * @return {GameObject}
     */
    getObject(entityId) {
        return this.objects[entityId];
    };

    addOrUpdate(entity) {
        let gameObject = this.getObject(entity.id);
        if (gameObject) {
            // FIXME Der Server sollte mir nur Entities liefern, die sich auch geändert haben
            if (gameObject.isMoveable) {
                gameObject.setPosition(entity.position.x, entity.position.y);
                if (!gameObject.rotateOnPositioning) {
                    gameObject.setRotation(entity.rotation);
                }
                if (Develop.isActive()) {
                    gameObject.updateAABB(entity.aabb);
                }
            }

            if (gameObject instanceof Resource) {
                gameObject.stock = entity.stock;
            }
        } else {
            switch (entity.type) {
                case Character:
                    gameObject = new Character(entity.id, entity.position.x, entity.position.y, entity.name, false);
                    break;
                case Placeable:
                    gameObject = new Placeable(entity.item, entity.position.x, entity.position.y);
                    break;
                case DebugCircle:
                    if (!Develop.isActive()) {
                        return;
                    }
                // Fallthrough
                default:
                    gameObject = new entity.type(entity.position.x, entity.position.y, entity.radius);
            }

            if (gameObject instanceof Resource) {
                gameObject.capacity = entity.capacity;
                gameObject.stock = entity.stock;
            }

            this.objects[entity.id] = gameObject;
            gameObject.id = entity.id;

            if (gameObject.visibleOnMinimap) {
                Game.miniMap.add(gameObject, Layer.OTHER);
                Game.largeMap.add(gameObject);
            }

            if (Develop.isActive()) {
                gameObject.updateAABB(entity.aabb);
            }
        }

        if (entity.type === Character) {
            let character: Character = gameObject;

            /**
             * Handle equipment
             */
            let slotsToHandle = Object.keys(EquipmentSlot).map(k => EquipmentSlot[k as any]);
            removeElement(slotsToHandle, EquipmentSlot.PLACEABLE);

            if (isDefined(entity.equipment)) {
                entity.equipment.forEach((equippedItem) => {
                    let slot = Equipment.Helper.getItemEquipmentSlot(equippedItem);
                    removeElement(slotsToHandle, slot);
                    let currentlyEquippedItem = character.getEquippedItem(slot);
                    if (currentlyEquippedItem === equippedItem) {
                        return;
                    }
                    if (currentlyEquippedItem !== null) {
                        character.unequipItem(slot);
                    }
                    gameObject.equipItem(equippedItem, slot);
                });
            }

            // All Slots that are not equipped according to backend are dropped.
            slotsToHandle.forEach(slot => {
                gameObject.unequipItem(slot);
            });

            /**
             * Handle Actions
             */
            if (entity.currentAction) {
                switch (entity.currentAction.actionType) {
                    case BerryhunterApi.ActionType.Primary:
                        character.action(entity.currentAction.ticksRemaining);
                        break;
                    default:
                        let actionTypeKnown = false;
                        for (let actionType in BerryhunterApi.ActionType) {
                            if (BerryhunterApi.ActionType.hasOwnProperty(actionType)) {
                                if (entity.currentAction.actionType === BerryhunterApi.ActionType[actionType]) {
                                    actionTypeKnown = true;
                                    break;
                                }
                            }
                        }
                        if (!actionTypeKnown) {
                            console.warn("Unknown Action by " + entity.name + ": " + entity.currentAction.actionType + " (" + entity.currentAction.ticksRemaining + " Ticks remaining)");
                        }
                        break;
                }
            }
        }

        if (Array.isArray(entity.statusEffects)) {
            gameObject.updateStatusEffects(entity.statusEffects);
        }
    };

    newSnapshot(entities) {
        let removedObjects = _clone(this.objects);
        entities.forEach((entity) => {
            delete removedObjects[entity.id];
        });

        Object.values(removedObjects).forEach((entity: GameObject) => {
            this.objects[entity.id].hide();
            delete this.objects[entity.id];
        }, this);
    };

    getObjectsInRange() {
        return this.getObjectsInView();
    }

    getObjectsInView() {
        return Object.values(this.objects);
    };

    clear() {
        Object.values(this.objects).forEach(function (gameObject: GameObject) {
            gameObject.hide();
        });
        this.objects = {};
    }
}
