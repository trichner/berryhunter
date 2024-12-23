import {Character} from '../../game-objects/logic/Character';
import {StatusEffect} from '../../game-objects/logic/StatusEffect';
import {Controls} from '../../controls/logic/Controls';
import {Camera} from '../../camera/logic/Camera';
import {Inventory} from '../../items/logic/Inventory';
import {DamageState, VitalSigns, VitalSignValues} from '../../vital-signs/logic/VitalSigns';
import {isDefined} from '../../common/logic/Utils';
import {BasicConfig as Constants} from '../../../client-data/BasicConfig';
import {BerryhunterApi} from '../../backend/logic/BerryhunterApi';
import {MiniMap} from '../../mini-map/logic/MiniMap';
import {PlayerCraftingStateChangedEvent, PlayerCreatedEvent, PlayerDamagedEvent} from '../../core/logic/Events';
import './PlayerJuice';

export class Player {
    craftProgress;
    character: Character;
    controls: Controls;
    camera: Camera;
    inventory: Inventory;
    vitalSigns: VitalSigns;
    craftableItems;

    constructor(id: number, x: number, y: number, name: string, miniMap: MiniMap) {
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
        miniMap.add(this.character);
        miniMap.setPlayerCharacter(this.character);

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
        PlayerCraftingStateChangedEvent.trigger(true);
    }

    updateFromBackend(entity) {
        if (isDefined(entity.position)) {
            this.character.setPosition(entity.position.x, entity.position.y);
        }

        let damageState: DamageState = DamageState.None;
        if (entity.statusEffects.includes(StatusEffect.Damaged)) {
            damageState = DamageState.OneTime;
            PlayerDamagedEvent.trigger({player: this, damageState: damageState});
        } else if (entity.statusEffects.includes(StatusEffect.DamagedAmbient)) {
            damageState = DamageState.Continuous;
            PlayerDamagedEvent.trigger({player: this, damageState: damageState});
        }

        let newVitalSigns: VitalSignValues = {
            health: entity.health,
            satiety: entity.satiety,
            bodyHeat: entity.bodyHeat
        };
        this.vitalSigns.updateFromBackend(newVitalSigns, damageState);

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
