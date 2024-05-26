import {
    ControlsActionEvent,
    ControlsMovementEvent,
    ControlsRotateEvent,
    GameSetupEvent,
} from './Events';
import {BasicConfig as Constants} from '../config/Basic';
import * as Equipment from './items/Equipment';
import * as Console from './Console';
import * as Chat from './Chat';
import {isDefined, isUndefined, TwoDimensional} from './Utils';
import Tock from 'tocktimer';
import {KeyCodes} from './input/keyboard/keys/KeyCodes';
import {BerryhunterApi} from './backend/BerryhunterApi';
import {Character} from './gameObjects/Character';
import {GameState, IGame} from './interfaces/IGame';
import {radians} from './interfaces/Types';
import {InputAction, InputMessage} from './backend/messages/outgoing/InputMessage';
import {Vector} from './Vector';
import {Develop} from './develop/_Develop';

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});

let consoleCooldown = 0;

class Keys {
    keys;

    constructor(...keys: number[]) {
        this.keys = [];
        for (let i = 0; i < arguments.length; i++) {
            this.keys.push(Game.inputManager.keyboard.addKey(arguments[i]));
        }
    }

    get isDown() {
        return this.keys.some(function (key) {
            return key.isDown;
        });
    }
}


export class Controls {
    isCraftInProgress: () => boolean;
    character: Character;
    lastX: number;
    lastY: number;

    upKeys = new Keys(KeyCodes.W, KeyCodes.UP);
    downKeys = new Keys(KeyCodes.S, KeyCodes.DOWN);
    leftKeys = new Keys(KeyCodes.A, KeyCodes.LEFT);
    rightKeys = new Keys(KeyCodes.D, KeyCodes.RIGHT);
    actionKeys = new Keys(KeyCodes.E, KeyCodes.SPACE);
    altActionKeys = new Keys(KeyCodes.Q, KeyCodes.SHIFT);
    pauseKeys = new Keys(KeyCodes.P);
    hitAnimationTick: number = 0;
    clock: Tock;
    inventoryAction: InputAction;
    updateTime: number;

    /**
     * @param {Character} character
     * @param {function} isCraftInProgress Model function. Can be called to determine if a craft is in progress.
     */
    constructor(character: Character, isCraftInProgress: () => boolean) {
        this.isCraftInProgress = isCraftInProgress;
        this.character = character;

        if (Constants.ALWAYS_VIEW_CURSOR) {
            this.lastX = character.getX();
            this.lastY = character.getY();
        }

        this.clock = new Tock({
            interval: Constants.INPUT_TICKRATE,
            callback: this.update.bind(this),
            complete: () => {},
        });

        this.clock.start();

        // Not part of Inputs as its way more complicated to implement desired behavior there.
        window.addEventListener('keydown', Controls.handleFunctionKeys);
    }

    static handleFunctionKeys(event: KeyboardEvent) {
        if (Chat.isOpen()) {
            return;
        }

        if (Console.KEY_CODE === event.code) {
            if (consoleCooldown > 0) {
                consoleCooldown--;
            } else {
                Console.toggle();
                consoleCooldown = 30;
            }
            event.preventDefault();
            return;
        }
        if (Console.isOpen()) {
            return;
        }


        if (Chat.KEYS.indexOf(event.which) !== -1) {
            Chat.show();
            event.preventDefault();
            return;
        }
    }

    /**
     * @return {boolean} whether or not the action was allowed. Visuals have to be aligned to this return value
     */
    onInventoryAction(item, actionType) {
        if (this.isCraftInProgress()) {
            return false;
        }

        this.inventoryAction = {
            item: item,
            actionType: actionType,
        };
        return true;
    }

    update() {
        let inputManager = Game.inputManager;
        inputManager.update(Date.now());

        if (Game.state !== GameState.PLAYING) {
            return;
        }

        if (Develop.isActive()) {
            if (isUndefined(this.updateTime)) {
                this.updateTime = this.clock.lap();
                Develop.get().logClientTickRate(this.updateTime);
            } else {
                let currentTime = this.clock.lap();
                let timeSinceUpdate = currentTime - this.updateTime;
                this.updateTime = currentTime;
                Develop.get().logClientTickRate(timeSinceUpdate);
            }

            // Pausing is only available in Develop mode
            if (this.pauseKeys.isDown) {
                if (Game.playing) {
                    Game.pause();
                } else {
                    Game.play();
                }
                return;
            }
        }

        if (consoleCooldown > 0) {
            consoleCooldown--;
        }

        let movement = new Vector();

        if (this.upKeys.isDown) {
            movement.y -= 1;
        }
        if (this.downKeys.isDown) {
            movement.y += 1;
        }
        if (this.leftKeys.isDown) {
            movement.x -= 1;
        }
        if (this.rightKeys.isDown) {
            movement.x += 1;
        }

        let action: InputAction = null;
        if (this.hitAnimationTick) {
            // Make sure tick 0 gets passed to the character to finish animation
            this.hitAnimationTick--;
        } else {
            if (isDefined(this.inventoryAction)) {
                action = this.inventoryAction;
                delete this.inventoryAction;
            } else {
                if (this.isCraftInProgress()) {
                    // Don't check for actions
                } else if (this.actionKeys.isDown || inputManager.activePointer.leftButtonDown()) {
                    this.hitAnimationTick = this.character.action();
                    switch (this.character.currentAction) {
                        case 'MAIN':
                        case 'ALT':
                            action = {
                                item: Game.player.character.getEquippedItem(Equipment.EquipmentSlot.HAND),
                                actionType: BerryhunterApi.ActionType.Primary,
                            };
                            break;
                        case 'PLACING':
                            let placedItem = this.character.getEquippedItem(Equipment.EquipmentSlot.PLACEABLE);

                            if (!placedItem.placeable.multiPlacing) {
                                Game.player.inventory.unequipItem(placedItem, Equipment.EquipmentSlot.PLACEABLE);
                            }

                            action = {
                                item: placedItem,
                                actionType: BerryhunterApi.ActionType.PlaceItem,
                            };
                            break;
                    }
                } else if (this.altActionKeys.isDown || inputManager.activePointer.rightButtonDown()) {
                    // Alt Action is only cancelling an equipped placeable - not need to report to backend
                    this.hitAnimationTick = this.character.altAction();
                }
            }
        }

        let input = new InputMessage();
        let hasInput = false;

        if (Constants.ALWAYS_VIEW_CURSOR) {
            if (inputManager.activePointer.justMoved ||
                this.lastX !== this.character.getX() ||
                this.lastY !== this.character.getY()) {

                input.rotation = this.adjustCharacterRotation();
                hasInput = true;
                this.lastX = this.character.getX();
                this.lastY = this.character.getY();
            }
        } else if (inputManager.activePointer.justMoved) {
            input.rotation = this.adjustCharacterRotation();
            hasInput = true;
        }

        if (movement.x !== 0 || movement.y !== 0) {
            input.movement = movement;
            ControlsMovementEvent.trigger(movement);
            hasInput = true;
        }

        if (action !== null) {
            input.action = action;
            ControlsActionEvent.trigger(action);
            hasInput = true;
        }

        if (hasInput) {
            if (isUndefined(input.rotation)) {
                // Just send the current character rotation to not confuse the server
                input.rotation = this.character.getRotation();
            }

            if (inputManager.activePointer.justMoved) {
                ControlsRotateEvent.trigger(input.rotation);
            }

            input.send();
        }


    }

    adjustCharacterRotation() {
        let pointer = Game.inputManager.activePointer;

        if (isDefined(Game.player)) {
            let characterX = Game.player.camera.getScreenX(this.character.getX());
            let characterY = Game.player.camera.getScreenY(this.character.getY());

            let rotation: radians = TwoDimensional.angleBetween(
                pointer.x,
                pointer.y,
                characterX,
                characterY,
            );

            this.character.setRotation(rotation);

            return rotation;
        }

        return this.character.shape.rotation;
    }

    destroy() {
        this.clock.stop();
        window.removeEventListener('keydown', Controls.handleFunctionKeys);
    }
}
