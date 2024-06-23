import {Animation} from '../Animation';
import {EaseDisplayObject, Ease} from 'pixi-ease';
import {ColorMatrixFilter, Container} from 'pixi.js';
import {flood} from '../ColorMatrixFilterExtensions';

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
    colorMatrix: ColorMatrixFilter;
    startAlpha: number;
    endAlpha: number;
    shape: Container;

    private constructor(
        definition: StatusEffectDefinition,
        gameObjectShape: Container,
        red: number,
        green: number,
        blue: number,
        startAlpha: number,
        endAlpha: number,
    ) {
        this.id = definition.id;
        this.priority = definition.priority;
        this.shape = gameObjectShape;

        this.colorMatrix = new ColorMatrixFilter();
        flood(this.colorMatrix, red, green, blue, 1);
        this.colorMatrix.alpha = startAlpha;
        this.colorMatrix.enabled = false;

        this.startAlpha = startAlpha;
        this.endAlpha = endAlpha;

        if (Array.isArray(gameObjectShape.filters)) {
            gameObjectShape.filters = [...gameObjectShape.filters, this.colorMatrix];
        } else {
            gameObjectShape.filters = [this.colorMatrix];
        }
    }

    static forDamaged(gameObjectShape: Container) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.Damaged, gameObjectShape, 191, 21, 58, 0.5, 0.1);
    }

    static forDamagedOverTime(gameObjectShape: Container) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.DamagedAmbient, gameObjectShape, 191, 21, 58, 0.8, 0.2);
    }

    static forFreezing(gameObjectShape: Container) {
        // #1E7A1E
        return new StatusEffect(StatusEffect.Freezing, gameObjectShape, 18, 87, 153, 0.4, 0.8);
    }

    static forStarving(gameObjectShape: Container) {
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
            this.colorMatrix as unknown as Container,
            {alpha: this.endAlpha},
            {
                duration: 200,
                repeat: true,
                reverse: true,
                ease: 'easeInOutCubic',
            },
        ) as EaseDisplayObject;

        if (this.id === StatusEffect.Damaged.id){
            //Squeeze scale. Possible combine with "Animation", but atm reverse and on/once does not seem to work?
            //animation.add(this.shape, { scaleX: 1.2, scaleY: 0.8 }, { reverse: true, removeExisting: true, duration: 200, ease: 'easeOutElastic' });

            let ease = new Ease({ duration: 200, ease: 'easeOutElastic' }); 

            ease.add(this.shape.scale, { x: 1.2, y: 0.8 }, { duration: 200, ease: 'easeOutElastic' });
            ease.once('complete', () => {
                ease.add(this.shape.scale, { x: 1, y: 1 }, { duration: 200, ease: 'easeInBounce' });
            });
        }

        // If the startAlpha is lower, we want the animation to end on the start
        // in the opposite case, the animation should end on the end (without reversing)
        let isReverse = (this.startAlpha > this.endAlpha);
        // TODO test this
        to.on('reverse', () => {
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
