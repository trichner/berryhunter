import {Character} from './gameObjects/Character';
import {StatusEffect} from './gameObjects/StatusEffect';
import {Controls} from './Controls';
import {Camera} from './Camera';
import {Inventory} from './items/Inventory';
import {VitalSigns} from './VitalSigns';
import {isDefined} from './Utils';
import {BasicConfig as Constants} from '../config/Basic';
import {BerryhunterApi} from './backend/BerryhunterApi';
import {Layer, MiniMap} from "./MiniMap";
import {PlayerCreatedEvent} from "./Events";

export class Player {
    craftProgress;
    character: Character;
    controls: Controls;
    camera: Camera;
    inventory: Inventory;
    vitalSigns: VitalSigns;
    craftableItems;

    constructor(id, x, y, name, miniMap: MiniMap) {
        /**
         * Either <code>null</code> or number of seconds
         * remaining until the current craft is done.
         * @type {boolean|number}
         */
        this.craftProgress = null;

        this.character = new Character(id, x, y, name, true);
        this.character.visibleOnMinimap = true;

        this.controls = new Controls(this.character, this.isCraftInProgress.bind(this));

        this.camera = new Camera(this.character);
        miniMap.add(this.character, Layer.CHARACTER);

        this.inventory = new Inventory(this.character, this.isCraftInProgress.bind(this));

        this.vitalSigns = new VitalSigns();

        this.craftableItems = [];
    }

    init() {
        this.inventory.init();
        PlayerCreatedEvent.trigger(this);
    }

    isCraftInProgress() {
        return this.craftProgress !== null;
    }

    startCraftProgress(craftingTime) {
        this.craftProgress = {
            requiredTicks: craftingTime * 1000 / Constants.SERVER_TICKRATE
        };
        this.craftProgress.remainingTicks = this.craftProgress.requiredTicks;
        this.character.craftingIndicator.visible = true;
    }

    updateFromBackend(entity) {
        if (isDefined(entity.position)) {
            this.character.setPosition(entity.position.x, entity.position.y);
        }

        if (entity.statusEffects.indexOf(StatusEffect.Damaged) !== -1) {
            this.vitalSigns.onDamageTaken();
        } else if (entity.statusEffects.indexOf(StatusEffect.DamagedAmbient) !== -1) {
            this.vitalSigns.onDamageTaken(true);
        }

        let newVitalSigns = {
            health: entity.health,
            satiety: entity.satiety,
            bodyHeat: entity.bodyHeat
        };
        this.vitalSigns.updateFromBackend(newVitalSigns);

        /**
         * Handle Actions
         */
        if (entity.currentAction) {
            switch (entity.currentAction.actionType) {
                case BerryhunterApi.ActionType.CraftItem:
                    let recipe = entity.currentAction.item.recipe;
                    let craftIcon = recipe.clickableIcon;
                    if (this.isCraftInProgress()) {
                        let ticksRemaining = entity.currentAction.ticksRemaining;
                        this.craftProgress.remainingTicks = ticksRemaining;
                        craftIcon.updateProgress(ticksRemaining);
                    } else {
                        craftIcon.startProgress(recipe.craftingTime);
                        this.startCraftProgress(recipe.craftingTime);
                    }
                    break;
            }
        }
    }

    remove() {
        this.character.remove();
        this.controls.destroy();
        this.camera.destroy();
        this.inventory.clear();
        this.vitalSigns.destroy();
    }
}
