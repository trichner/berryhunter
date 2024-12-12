import * as BackendConstants from '../../BackendConstants';
import * as Resources from '../../../../game-objects/logic/Resources';
import * as Mobs from '../../../../game-objects/logic/Mobs';
import {DebugCircle} from '../../../../internal-tools/develop/logic/DebugCircle';
import {Character} from '../../../../game-objects/logic/Character';
import {Placeable} from '../../../../game-objects/logic/Placeable';
import {isFunction} from '../../../../common/logic/Utils';
import {StatusEffectDefinition} from '../../../../game-objects/logic/StatusEffect'
import {BerryhunterApi} from '../../BerryhunterApi';

export class Spectator {
    id: number;
    position: { x, y };
    isSpectator: boolean = true;

    /**
     * @param {BerryhunterApi.Spectator} spectator
     */
    constructor(spectator) {
        this.id = spectator.id().toFloat64();
        this.position = unmarshalVec2f(spectator.pos());
    }
}

export class GameStateMessage {
    tick: number;
    player;
    inventory;
    entities;

    constructor(gameState: BerryhunterApi.GameState) {
        this.tick = gameState.tick().toFloat64();

        switch (gameState.playerType()) {
            case BerryhunterApi.Player.Spectator:
                this.player = new Spectator(gameState.player(new BerryhunterApi.Spectator()));
                break;
            case BerryhunterApi.Player.Character:
                this.player = unmarshalEntity(
                    gameState.player(new BerryhunterApi.Character()),
                    BerryhunterApi.AnyEntity.Character);
                break;
        }

        this.inventory = [];
        for (let i = 0; i < gameState.inventoryLength(); ++i) {
            let itemStack = unmarshalItemStack(gameState.inventory(i));
            this.inventory[itemStack.slot] = itemStack;
        }

        this.entities = [];
        for (let i = 0; i < gameState.entitiesLength(); ++i) {
            this.entities.push(unmarshalWrappedEntity(gameState.entities(i)));
        }
    }
}

/**
 *
 * @param {BerryhunterApi.Vec2f|null} vec2f
 */
function unmarshalVec2f(vec2f) {
    return {
        x: vec2f.x(),
        y: vec2f.y(),
    }
}

/**
 * @param {BerryhunterApi.Entity} wrappedEntity
 */
function unmarshalWrappedEntity(wrappedEntity: BerryhunterApi.Entity) {
    const eType: BerryhunterApi.AnyEntity = wrappedEntity.eType();

    if (eType === BerryhunterApi.AnyEntity.NONE) {
        return null;
    }

    let entity;

    for (let eTypeName in BerryhunterApi.AnyEntity) {
        // @ts-ignore
        if (BerryhunterApi.AnyEntity[eTypeName] === eType) {
            entity = new BerryhunterApi[eTypeName]();
        }
    }

    /**
     * @type {BerryhunterApi.Mob | BerryhunterApi.Resource | BerryhunterApi.Player}
     */
    entity = wrappedEntity.e(entity);

    return unmarshalEntity(entity, eType);
}

function unmarshalEntity(entity, eType) {
    let id = entity.id().toFloat64();

    if (id === 0) {
        return null;
    }

    let result = {
        id: id,
        position: unmarshalVec2f(entity.pos()),
        radius: entity.radius(),
        type: unmarshalEntityType(entity.entityType()),
        aabb: unmarshalAABB(entity.aabb()),
        capacity: undefined,
        stock: undefined,
        item: undefined,
        rotation: undefined,
        isSpectator: undefined,
        isHit: undefined,
        currentAction: undefined,
        name: undefined,
        equipment: undefined,
        health: undefined,
        satiety: undefined,
        bodyHeat: undefined,
        statusEffects: undefined,
    };

    if (eType === BerryhunterApi.AnyEntity.Resource) {
        result.capacity = entity.capacity();
        result.stock = entity.stock();
    }

    if (eType === BerryhunterApi.AnyEntity.Placeable) {
        result.item = unmarshalItem(entity.item());
    }

    if (eType === BerryhunterApi.AnyEntity.Mob) {
        result.rotation = entity.rotation();
    }

    if (eType === BerryhunterApi.AnyEntity.Character) {
        result.isSpectator = false;

        result.rotation = entity.rotation();
        result.isHit = entity.isHit();
        let currentAction = entity.currentAction();
        if (currentAction) {
            result.currentAction = {
                ticksRemaining: currentAction.ticksRemaining(),
                actionType: currentAction.actionType(),
                item: unmarshalItem(currentAction.item()),
            };
        }

        result.name = entity.name();

        result.health = entity.health();
        result.satiety = entity.satiety();
        result.bodyHeat = entity.bodyTemperature();

        result.equipment = [];
        for (let i = 0; i < entity.equipmentLength(); ++i) {
            result.equipment.push(unmarshalItem(entity.equipment(i)));
        }
    }

    if (isFunction(entity.statusEffectsLength) &&
        isFunction(entity.statusEffects)) {
        result.statusEffects = unmarshalStatusEffects(entity.statusEffectsLength(), entity.statusEffects.bind(entity));
    }

    return result;
}

/**
 * Has to be in sync with BerryhunterApi.EntityType
 */
const gameObjectClasses = [
    DebugCircle,
    undefined,
    Resources.RoundTree,
    Resources.MarioTree,
    Character,
    Resources.Stone,
    Resources.Bronze,
    Resources.Iron,
    Resources.BerryBush,
    Mobs.Dodo,
    Mobs.SaberToothCat,
    Mobs.Mammoth,
    Placeable,
    Resources.Titanium,
    Resources.Flower,
    Mobs.AngryMammoth,
    Resources.TitaniumShard,
];

function unmarshalEntityType(entityType) {
    return gameObjectClasses[entityType];
}

/**
 *
 * @param {BerryhunterApi.AABB|null} aabb
 */
function unmarshalAABB(aabb) {
    return {
        LowerX: aabb.lower().x(),
        LowerY: aabb.lower().y(),
        UpperX: aabb.upper().x(),
        UpperY: aabb.upper().y(),
    };
}

/**
 *
 * @param {BerryhunterApi.ItemStack} itemStack
 */
function unmarshalItemStack(itemStack) {
    return {
        item: unmarshalItem(itemStack.item()),
        count: itemStack.count(),
        slot: itemStack.slot(),
    };
}


/**
 * @param {number} itemId
 */
function unmarshalItem(itemId) {
    return BackendConstants.itemLookupTable[itemId];
}

function unmarshalStatusEffects(length, getter): StatusEffectDefinition[] {
    let definitions: StatusEffectDefinition[] = [];

    for (let i = 0; i < length; ++i) {
        definitions.push(BackendConstants.statusEffectLookupTable[getter(i)]);
    }

    return definitions;
}
