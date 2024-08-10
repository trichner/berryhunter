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
    originalScaleX: number;
    originalScaleY: number;

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
        this.originalScaleX = this.shape.scale.x;
        this.originalScaleY = this.shape.scale.y;

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
    }

    show() {
        if (this.showing) {
            this.playFromBeginning();
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

        if (this.id === StatusEffect.Damaged.id) {
            let ease = new Ease({});

            // Generate random scale factors
            const randomScaleX = this.originalScaleX * (1.1 + Math.random() * 0.2); // Between 1.1x and 1.3x
            const randomScaleY = this.originalScaleY * (0.7 + Math.random() * 0.2); // Between 0.7x and 0.9x

            ease.add(this.shape.scale, { x: randomScaleX, y: randomScaleY }, { duration: 60, ease: 'easeOutElastic' });

            ease.once('complete', () => {
                ease.add(this.shape.scale, { x: this.originalScaleX, y: this.originalScaleY }, { duration: 80, ease: 'easeInBounce' });
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

    reset() {
        if (this.showing) {
            this.showing = false;
            this.colorMatrix.alpha = this.startAlpha;
            this.shape.scale.set(1, 1);
            this.colorMatrix.enabled = false;
        }
    }

    playFromBeginning() {
        if (this.showing) {
            this.reset(); // Reset the current animation and properties

            // Restart the animation
            this.show();
        }
    }

    hide() {
        this.showing = false;
    }

    forceHide() {
        this.hide();
        this.colorMatrix.enabled = false;
    }
}