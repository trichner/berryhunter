import _clone = require('lodash/clone');
import {isDefined, removeElement} from '../../common/logic/Utils';
import {DebugCircle} from '../../internal-tools/develop/logic/DebugCircle';
import {GameObject} from '../../game-objects/logic/_GameObject';
import {Character} from '../../game-objects/logic/Character';
import {Placeable} from '../../game-objects/logic/Placeable';
import {Resource} from '../../game-objects/logic/Resources';
import * as Equipment from '../../items/logic/Equipment';
import {EquipmentSlot} from '../../items/logic/Equipment';
import {BerryhunterApi} from './BerryhunterApi';
import {Develop} from '../../internal-tools/develop/logic/_Develop';
import {gameObjectId} from '../../common/logic/Types';
import {Vector} from '../../core/logic/Vector';
import {IMiniMapRendered} from '../../mini-map/logic/MiniMapInterfaces';
import {MiniMap} from '../../mini-map/logic/MiniMap';


export class EntityManager {
    radius: number;
    width: number;
    height: number;

    objects: {[key: gameObjectId]: GameObject} = {};
    private miniMap: MiniMap;

    constructor(radius: number, miniMap: MiniMap) {
        this.radius = radius;
        this.width = 2 * radius;
        this.height = 2 * radius;

        this.miniMap = miniMap;
    }

    getObject(entityId: gameObjectId): GameObject {
        return this.objects[entityId];
    };

    addOrUpdate(entity) {
        let gameObject = this.getObject(entity.id);
        if (gameObject) {
            // FIXME Der Server sollte mir nur Entities liefern, die sich auch geändert haben
            if (gameObject.isMovable) {
                gameObject.setPosition(entity.position.x, entity.position.y);
                if (!gameObject.rotateOnPositioning) {
                    gameObject.setRotation(entity.rotation);
                }
                if (Develop.isActive()) {
                    gameObject['updateAABB'](entity.aabb);
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
                    gameObject = new Placeable(entity.id, entity.item, entity.position.x, entity.position.y);
                    break;
                case DebugCircle:
                    if (!Develop.isActive()) {
                        return;
                    }
                // Fallthrough
                default:
                    gameObject = new entity.type(entity.id, entity.position.x, entity.position.y, entity.radius);
            }

            if (gameObject instanceof Resource) {
                gameObject.capacity = entity.capacity;
                gameObject.stock = entity.stock;
            }

            this.objects[entity.id] = gameObject;

            if (gameObject.visibleOnMinimap) {
                this.miniMap.add(gameObject as unknown as IMiniMapRendered);
            }

            if (Develop.isActive()) {
                gameObject['updateAABB'](entity.aabb);
            }
        }

        if (entity.type === Character) {
            const character: Character = gameObject as Character;

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
                    character.equipItem(equippedItem, slot);
                });
            }

            // All Slots that are not equipped according to backend are dropped.
            slotsToHandle.forEach(slot => {
                character.unequipItem(slot);
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

        Object.values(removedObjects).forEach((gameObject: GameObject) => {
            this.objects[gameObject.id].hide();
            if (gameObject.visibleOnMinimap) {
                this.miniMap.remove(gameObject as unknown as IMiniMapRendered);
            }
            delete this.objects[gameObject.id];
        }, this);
    };

    getObjectsInRange(position: Vector, distance: number) {
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
