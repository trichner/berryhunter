import {ExtendedColorMatrixFilter} from '../ExtendedColorMatrixFilter';
import {Animation} from "../Animation";
import {EaseDisplayObject} from "pixi-ease";
import { DisplayObject } from 'pixi.js';

export interface StatusEffectDefinition {
    id: string;
    priority: number;
}

export class StatusEffect implements StatusEffectDefinition {
    static Damaged: StatusEffectDefinition = {id: 'Damaged', priority: 1};
    static DamagedAmbient: StatusEffectDefinition = {id: 'DamagedAmbient', priority: 2};
    static Yielded: StatusEffectDefinition = {id: 'Yielded', priority: 3};
    static Freezing: StatusEffectDefinition = {id: 'Freezing', priority: 4};
    static Starving: StatusEffectDefinition = {id: 'Starving', priority: 5};
    static Regenerating: StatusEffectDefinition = {id: 'Regenerating', priority: 6};

    readonly id: string;
    readonly priority: number;

    showing: boolean = false;
    colorMatrix: ExtendedColorMatrixFilter;
    startAlpha: number;
    endAlpha: number;

    private constructor(definition: StatusEffectDefinition, gameObjectShape, red, green, blue, startAlpha, endAlpha) {
        this.id = definition.id;
        this.priority = definition.priority;

        this.colorMatrix = new ExtendedColorMatrixFilter();
        this.colorMatrix.flood(red, green, blue, 1);
        this.colorMatrix.alpha = startAlpha;
        this.colorMatrix.enabled = false;

        this.startAlpha = startAlpha;
        this.endAlpha = endAlpha;

        if (Array.isArray(gameObjectShape.filters)) {
            // filters are returned as copy
            let filters = gameObjectShape.filters;
            // so we modify the copy
            filters.push(this.colorMatrix);
            // and replace the filters with the modified copy
            gameObjectShape.filters = filters;
        } else {
            gameObjectShape.filters = [this.colorMatrix];
        }
    }

    static forDamaged(gameObjectShape) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.Damaged, gameObjectShape, 191, 21, 58, 0.8, 0.0);
    }

    static forDamagedOverTime(gameObjectShape) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.DamagedAmbient, gameObjectShape, 191, 21, 58, 0.8, 0.2);
    }

    static forFreezing(gameObjectShape) {
        // #1E7A1E
        return new StatusEffect(StatusEffect.Freezing, gameObjectShape, 18, 87, 153, 0.4, 0.8);
    }

    static forStarving(gameObjectShape) {
        // #125799
        return new StatusEffect(StatusEffect.Starving, gameObjectShape, 30, 120, 30, 0.2, 0.8);
    }

    static sortByPriority(statusEffects: StatusEffectDefinition[]): StatusEffectDefinition[] {
        return statusEffects.sort(function (a: StatusEffectDefinition, b: StatusEffectDefinition) {
            return a.priority - b.priority;
        });
    };

    show() {
        if (this.showing) {
            // Nothing to do, Effect is already showing
            return;
        }

        this.showing = true;

        this.colorMatrix.enabled = true;
        this.colorMatrix.alpha = this.startAlpha;

        let animation = new Animation();
        let to = animation.add(
            // TODO ugly, need to test and find better way
            this.colorMatrix as unknown as DisplayObject,
            {alpha: this.endAlpha},
            {
                duration: 500,
                repeat: true,
                reverse: true,
                ease: 'easeInOutCubic'
            }
        ) as EaseDisplayObject;

        // If the startAlpha is lower, we want the animation to end on the start
        // in the opposite case, the animation should end on the end (without reversing)
        let isReverse = (this.startAlpha > this.endAlpha);
        // TODO test this
        to.on('loop', () => {
            isReverse = !isReverse;
            // The effect was scheduled to be removed - remove the update function from the global ticker
            // the rest will be cleaned up by the GC
            if (!this.showing && !isReverse) {
                this.forceHide();
            }
        });
    }

    hide() {
        this.showing = false;
    }

    forceHide() {
        this.showing = false;
        this.colorMatrix.enabled = false;
    }
}
