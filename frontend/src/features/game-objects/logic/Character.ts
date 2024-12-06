import {GameObject} from './_GameObject';
import {BasicConfig as Constants} from '../../../client-data/BasicConfig';
import {hashCode, isDefined, random, randomFrom} from '../../../old-structure/Utils';
import * as Equipment from '../../items/logic/Equipment';
import {EquipmentSlot} from '../../items/logic/Equipment';
import {createInjectedSVG} from '../../core/logic/InjectedSVG';
import * as Preloading from '../../core/logic/Preloading';
import {Vector} from '../../core/logic/Vector';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {animateAction} from './AnimateAction';
import {StatusEffect} from './StatusEffect';
import {Animation} from '../../animations/logic/Animation';
import {Items} from '../../items/logic/Items';
import {IGame} from '../../../old-structure/interfaces/IGame';
import {CharacterEquippedItemEvent, CharacterMoved, GameSetupEvent, ISubscriptionToken, PlayerCraftingStateChangedEvent, PlayerMoved, PrerenderEvent} from '../../core/logic/Events';
import {ICharacterLike} from '../../../old-structure/interfaces/ICharacter';
import {createNamedContainer} from '../../../old-structure/CustomData';
import {Container, Graphics, Text, Texture} from 'pixi.js';
import * as TextDisplay from '../../../client-data/TextDisplay';
import {spatialAudio} from "../../../old-structure/juice/SpatialAudio";
import {swingLightAudioCues} from "../../../old-structure/juice/PlayerJuice";

let Game: IGame = null;
GameSetupEvent.subscribe((game: IGame) => {
    Game = game;
});

export interface Hand {
    container: { group: Container & { originalTranslation: { x: number, y: number } }, slot: Container };
    originalTranslation: { x: number, y: number };
    originalRotation: number;
}

export class Character extends GameObject implements ICharacterLike {
    static variants: {svg: Texture}[] = [];
    static svg: Texture;
    static craftingIndicator: { svg: Texture } = {svg: undefined};
    static hitAnimationFrameDuration: number = GraphicsConfig.character.actionAnimation.backendTicks - 1;


    name: string;
    nameElement: Text;
    isPlayerCharacter: boolean;
    movementSpeed: number;

    currentAction: string | false;
    equipmentSlotGroups;
    equippedItems;
    lastRemainingTicks: number = 0;
    useLeftHand: boolean = false;

    actualShape: Container;

    // Contains Containers that will mirror this characters position
    followGroups: Container[];

    messages: Text[];
    messagesGroup: Container;
    craftingIndicator: Container;

    leftHand: Hand;
    rightHand: Hand;

    private prerenderSubToken: ISubscriptionToken;

    constructor(id: number, x: number, y: number, name: string, isPlayerCharacter: boolean) {
        super(id, Game.layers.characters, x, y, GraphicsConfig.character.size, Math.PI / 2, Character.pickVariant(name).svg);
        this.name = name;
        this.isPlayerCharacter = isPlayerCharacter;
        this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;
        this.isMovable = true;
        this.visibleOnMinimap = false;
        this.turnRate = 0;

        this.currentAction = false;

        /**
         * Needs the same properties as Equipment.Slots
         */
        this.equipmentSlotGroups = {};
        this.equippedItems = {};
        for (let equipmentSlot in Equipment.EquipmentSlot) {
            //noinspection JSUnfilteredForInLoop
            this.equippedItems[equipmentSlot] = null;
        }

        let placeableSlot = new Container();
        this.actualShape.addChild(placeableSlot);
        this.equipmentSlotGroups[Equipment.EquipmentSlot.PLACEABLE] = placeableSlot;
        placeableSlot.position.set(
            Constants.PLACEMENT_RANGE,
            0,
        );
        placeableSlot.alpha = GraphicsConfig.equippedPlaceableOpacity;

        this.createHands();

        Object.values(this.equipmentSlotGroups).forEach((equipmentSlot: { originalTranslation: Vector, position }) => {
            equipmentSlot.originalTranslation = Vector.clone(equipmentSlot.position);
        });

        // Rotate the character according the 0-angle in drawing space
        this.setRotation(Math.PI / -2);

        this.createName();

        this.followGroups = [];

        let messagesFollowGroup = new Container();
        Game.layers.characterAdditions.chatMessages.addChild(messagesFollowGroup);
        this.followGroups.push(messagesFollowGroup);

        this.messages = [];
        this.messagesGroup = new Container();
        messagesFollowGroup.addChild(this.messagesGroup);
        this.messagesGroup.position.y = -1.2 * (this.size + 24);

        if (this.isPlayerCharacter) {
            const craftProgressFollowGroup = new Container();
            Game.layers.characterAdditions.craftProgress.addChild(craftProgressFollowGroup);
            this.followGroups.push(craftProgressFollowGroup);

            this.craftingIndicator = createNamedContainer('craftingIndicator');
            craftProgressFollowGroup.addChild(this.craftingIndicator);
            this.craftingIndicator.position.y = -1.2 * (this.size + 24) - 20;
            this.craftingIndicator.addChild(createInjectedSVG(Character.craftingIndicator.svg, 0, 0, 20));
            this.craftingIndicator.visible = false;

            const circle = new Graphics();
            circle.label = 'circle';
            this.craftingIndicator.addChild(circle);
            // Let the progress start at 12 o'clock
            circle.rotation = -0.5 * Math.PI;
        }

        this.followGroups.forEach(function (group: Container) {
            group.position.copyFrom(this.shape.position);
        }, this);

        this.prerenderSubToken = PrerenderEvent.subscribe(this.update, this);
    }

    /**
     * Picks a character variant based on the name. Same name = same look, by the magic of hash codes.
     */
    private static pickVariant(name: string): { svg: Texture } {
        return Character.variants[hashCode(name) % Character.variants.length];
    }

    initShape(svg: Texture, x: number, y: number, size: number, rotation: number) {
        let group = new Container();
        group.position.set(x, y);

        this.actualShape = createNamedContainer('actualShape');
        this.actualShape.addChild(super.initShape(svg, 0, 0, size, rotation));
        group.addChild(this.actualShape);

        return group;
    }

    createStatusEffects() {
        if (this.isPlayerCharacter) {
            super.createStatusEffects();
        }

        return {
            Damaged: StatusEffect.forDamaged(this.actualShape),
            DamagedAmbient: StatusEffect.forDamagedOverTime(this.actualShape),
            Freezing: StatusEffect.forFreezing(this.actualShape)
        };
    }

    getRotationShape() {
        return this.actualShape;
    }

    createHands() {
        // TODO Hände unter die Frisur rendern
        const handAngleDistance = 0.4;

        this.leftHand = this.createHand(-handAngleDistance);
        this.actualShape.addChild(this.leftHand.container.group);

        this.rightHand = this.createHand(handAngleDistance);
        this.actualShape.addChild(this.rightHand.container.group);

        this.equipmentSlotGroups[Equipment.EquipmentSlot.HAND] = this.rightHand.container.slot;
    }

    createHand(handAngleDistance: number):
        Hand {
        let group = new Container() as Container & { originalTranslation: { x: number, y: number } };

        const handAngle = 0;
        group.position.set(
            Math.cos(handAngle + Math.PI * handAngleDistance) * this.size * 0.8,
            Math.sin(handAngle + Math.PI * handAngleDistance) * this.size * 0.8,
        );

        let slotGroup = new Container();
        group.addChild(slotGroup);
        slotGroup.position.set(-this.size * 0.2, 0);
        slotGroup.rotation = Math.PI / 2;

        let handShape = new Graphics()
            .circle(0, 0, this.size * 0.2)
            .fill(GraphicsConfig.character.hands.fillColor)
            .stroke({
                width: 0.212 * 0.6 /* relative to size */,
                color: GraphicsConfig.character.hands.lineColor,
            });
        group.addChild(handShape);

        group['originalTranslation'] = Vector.clone(group.position);
        return {
            container: {
                group: group,
                slot: slotGroup,
            },
            originalTranslation: { x: group.x, y: group.y },
            originalRotation: group.rotation
        };
    }

    createName() {
        if (!this.name) {
            return;
        }

        if (isDefined(this.nameElement)) {
            this.nameElement.text = this.name;
            return;
        }

        const text = new Text({
            text: this.name,
            style: TextDisplay.style({
                fill: 'white',
            }),
        });
        text.anchor.set(0.5, 0.5);
        this.shape.addChild(text);
        text.position.set(0, -1.3 * this.size);
        this.nameElement = text;
    }

    createMinimapIcon() {
        let miniMapCfg = GraphicsConfig.miniMap.icons.character;
        return new Graphics()
            .circle(0, 0, this.size * miniMapCfg.sizeFactor)
            .fill({color: miniMapCfg.color, alpha: miniMapCfg.alpha});
    }

    getEquippedItemAnimationType() {
        let equippedItem = this.getEquippedItem(Equipment.EquipmentSlot.HAND);
        if (equippedItem === null) {
            equippedItem = Items.None;
        }

        return equippedItem.equipment.animation;
    }

    action(remainingTicks?: number) {
        if (isDefined(remainingTicks)) {
            if (this.lastRemainingTicks >= remainingTicks) {
                this.lastRemainingTicks = remainingTicks;
                return; // nothing to do - just let the animation roll
            }
            this.lastRemainingTicks = remainingTicks;
        }

        if (this.isSlotEquipped(Equipment.EquipmentSlot.PLACEABLE)) {
            this.animateAction(this.rightHand, 'stab', remainingTicks);
            this.currentAction = 'PLACING';
            return Character.hitAnimationFrameDuration;
        }

        // If nothing is equipped (= action with bare hand), use the boolean `useLeftHand`
        // to alternate between left and right punches
        if (this.getEquippedItem(Equipment.EquipmentSlot.HAND) === null && this.useLeftHand) {
            spatialAudio.play(randomFrom(swingLightAudioCues), this.getPosition(), { volume: 0.25, speed: random(0.8, 1.2) });
            this.currentAction = 'ALT';
            this.animateAction(this.leftHand, this.getEquippedItemAnimationType(), remainingTicks, true);
        } else {
            this.currentAction = 'MAIN';
            spatialAudio.play(randomFrom(swingLightAudioCues), this.getPosition(), { volume: 0.25, speed: random(0.8, 1.2) });
            this.animateAction(this.rightHand, this.getEquippedItemAnimationType(), remainingTicks);
        }
        this.useLeftHand = !this.useLeftHand;
        return Character.hitAnimationFrameDuration;
    }

    altAction() {
        if (this.isSlotEquipped(Equipment.EquipmentSlot.PLACEABLE)) {
            this.currentAction = false;
            return 0;
        }
    }

    private animateAction(
        hand: Hand,
        type: 'swing' | 'stab',
        remainingTicks?: number,
        mirrored: boolean = false,
    ) {
        animateAction({
            size: this.size,
            hand: hand,
            type,
            animation: new Animation(),
            animationFrame: remainingTicks,
            onDone: () => {
                this.currentAction = false;
            },
            mirrored
        });
    }

    update() {
        let timeDelta = Game.timeDelta;

        this.messages = this.messages.filter((message) => {
            message['timeToLife'] -= timeDelta;
            if (message['timeToLife'] <= 0) {
                this.messagesGroup.removeChild(message);
                return false;
            }
            return true;
        });

        this.followGroups.forEach((group) => {
            group.position.copyFrom(this.shape.position);
        }, this);

        if (this.isPlayerCharacter) {
            this.updatePlayerCharacter();
        }
    }

    updatePlayerCharacter() {
        if (Game.player.isCraftInProgress()) {
            const craftProgress = Game.player.craftProgress;
            let progress = 1 - (craftProgress.remainingTicks / craftProgress.requiredTicks);
            if (progress >= 1) {
                Game.player.craftProgress = null;
                progress = 1;
                this.craftingIndicator.visible = false;
            }

            const craftingIndicatorCircle = this.craftingIndicator.getChildByLabel('circle') as Graphics;
            craftingIndicatorCircle
                .clear()
                .arc(0, 0, 27, 0, progress * 2 * Math.PI)
                .stroke({
                    width: GraphicsConfig.character.craftingIndicator.lineWidth,
                    color: GraphicsConfig.character.craftingIndicator.lineColor,
                });
        }
        else {
            //TODO: this triggers all the time now, preventing audio loop from sticking when the window is not focused
            PlayerCraftingStateChangedEvent.trigger(false);
        }
    }

    isSlotEquipped(equipmentSlot: EquipmentSlot) {
        return this.equippedItems[equipmentSlot] !== null;
    }

    /**
     * @return {Boolean} whether or not the item was equipped
     */
    equipItem(item, equipmentSlot: EquipmentSlot): boolean {
        // If the same item is already equipped, just cancel
        if (this.equippedItems[equipmentSlot] === item) {
            return false;
        }

        let slotGroup = this.equipmentSlotGroups[equipmentSlot];
        // Offsets are applied to the slot itself to respect the slot rotation
        if (isDefined(item.graphic.offsetX)) {
            slotGroup.position.x = slotGroup.originalTranslation.x + item.graphic.offsetX * 2;
        } else {
            slotGroup.position.x = slotGroup.originalTranslation.x;
        }
        if (isDefined(item.graphic.offsetY)) {
            slotGroup.position.y = slotGroup.originalTranslation.y + item.graphic.offsetY * 2;
        } else {
            slotGroup.position.y = slotGroup.originalTranslation.y;
        }
        let equipmentGraphic = createInjectedSVG(item.graphic.svg, 0, 0, item.graphic.size);
        slotGroup.addChild(equipmentGraphic);

        if (equipmentSlot === Equipment.EquipmentSlot.PLACEABLE) {
            equipmentGraphic.rotation = Math.PI / -2;
        }

        this.equippedItems[equipmentSlot] = item;

        CharacterEquippedItemEvent.trigger({item, equipmentSlot});

        return true;
    }

    /**
     *
     * @param equipmentSlot
     * @return {Item} the item that was unequipped
     */
    unequipItem(equipmentSlot) {
        // If the slot is already empty, just cancel
        if (this.equippedItems[equipmentSlot] === null) {
            return;
        }

        let slotGroup = this.equipmentSlotGroups[equipmentSlot];
        if (!this.isSlotEquipped(equipmentSlot)) {
            return;
        }
        slotGroup.removeChildAt(0);

        let item = this.equippedItems[equipmentSlot];
        this.equippedItems[equipmentSlot] = null;

        return item;
    }

    getEquippedItem(equipmentSlot) {
        return this.equippedItems[equipmentSlot];
    }

    say(message: string) {
        let textStyle = TextDisplay.style({
            fill: '#E37313',
            stroke: {color: '#000000', width: 3},
            wordWrap: true,
            wordWrapWidth: 14 * 16, // no idea why, but it fits the 14em in HTML
            breakWords: true,
            lineHeight: 22,
        });
        let fontSize = textStyle.fontSize as number;

        // Move all currently displayed messages up
        this.messages.forEach((message) => {
            message.position.y -= fontSize * 1.1;
        });

        let messageShape = new Text({
            text: message,
            style: textStyle,
        });
        messageShape.anchor.set(0.5, 1);
        messageShape['timeToLife'] = Constants.CHAT_MESSAGE_DURATION;
        this.messagesGroup.addChild(messageShape);

        this.messages.push(messageShape);
    }

    hide() {
        super.hide();
        this.followGroups.forEach(function (followGroup) {
            followGroup.parent.removeChild(followGroup);
        });
    }

    remove() {
        this.hide();
        this.prerenderSubToken.unsubscribe();
    }

    override onMove(): void {
        if (this.isPlayerCharacter){
            PlayerMoved.trigger(this.getPosition());
        }
        else{
            CharacterMoved.trigger(this.getPosition());
        }
    }
}

Character.variants = new Array(GraphicsConfig.character.files.length);
GraphicsConfig.character.files.forEach((file: string | { default: string }, index: number) => {
    Character.variants[index] = {svg: undefined};
// noinspection JSIgnoredPromiseFromCall
    Preloading.registerGameObjectSVG(Character.variants[index], file, GraphicsConfig.character.size);
});

// noinspection JSIgnoredPromiseFromCall
Preloading.registerGameObjectSVG(
    Character.craftingIndicator,
    GraphicsConfig.character.craftingIndicator.file,
    GraphicsConfig.character.craftingIndicator.size);
