import { Animation } from '../Animation';
import { EaseDisplayObject, Ease } from 'pixi-ease';
import { ColorMatrixFilter, Container } from 'pixi.js';
import { flood } from '../ColorMatrixFilterExtensions';
import { PlayOptions, sound } from '@pixi/sound';
import { random } from '../Utils';
import { SoundData } from '../audio/SoundData';

export interface StatusEffectDefinition {
    id: string;
    priority: number;
}

export interface ColorEffect {
    red: number;
    green: number;
    blue: number;
    startAlpha: number;
    endAlpha: number;
}

export interface EaseEffect {
    type: string;
    from : number;
    to: number;
}

export class StatusEffect implements StatusEffectDefinition {
    static Damaged: StatusEffectDefinition = {id: 'Damaged', priority: 1};
    static DamagedAmbient: StatusEffectDefinition = {id: 'DamagedAmbient', priority: 2};
    static Yielded: StatusEffectDefinition = {id: 'Yielded', priority: 3};
    static Freezing: StatusEffectDefinition = {id: 'Freezing', priority: 4};
    static Starving: StatusEffectDefinition = {id: 'Starving', priority: 5};
    static ResourceHit: StatusEffectDefinition = {id: 'Hit', priority: 5};
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
    easeEffects?: EaseEffect[];
    soundData?: SoundData;

    private constructor(
        definition: StatusEffectDefinition,
        gameObjectShape: Container,
        colorEffect? : ColorEffect,
        easeEffects?: EaseEffect[],
        soundData? : SoundData
    ) {
        this.id = definition.id;
        this.priority = definition.priority;
        this.shape = gameObjectShape;
        this.originalScaleX = this.shape.scale.x;
        this.originalScaleY = this.shape.scale.y;

        if (colorEffect) {
            this.colorMatrix = new ColorMatrixFilter();
            flood(this.colorMatrix, colorEffect.red, colorEffect.green, colorEffect.blue, 1);
            this.colorMatrix.alpha = colorEffect.startAlpha;
            this.colorMatrix.enabled = false;
    
            this.startAlpha = colorEffect.startAlpha;
            this.endAlpha = colorEffect.endAlpha;

            if (Array.isArray(gameObjectShape.filters)) {
                gameObjectShape.filters = [...gameObjectShape.filters, this.colorMatrix];
            } else {
                gameObjectShape.filters = [this.colorMatrix];
            }
        }

        this.easeEffects = easeEffects;

        if (this.soundData && this.soundData.soundId)
            this.soundData = soundData;
    }

    static forDamaged(gameObjectShape: Container, soundId? : string) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.Damaged, gameObjectShape,
            { red: 191, green: 21, blue: 58, startAlpha: 0.5, endAlpha: 0.1 },
            [ { type: 'scale', from: 1.1, to: 0.7 } ],
            { soundId: soundId, options: {
                speed: random(0.8, 0.9),
                volume: random(0.8, 0.9),
            } });
    }

    static forDamagedOverTime(gameObjectShape: Container) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.DamagedAmbient, gameObjectShape, {
            red: 191,
            green: 21,
            blue: 58,
            startAlpha: 0.8,
            endAlpha: 0.2
        });
    }

    static forFreezing(gameObjectShape: Container) {
        // #125799
        return new StatusEffect(StatusEffect.Freezing, gameObjectShape, {
            red: 18,
            green: 87,
            blue: 153,
            startAlpha: 0.4,
            endAlpha: 0.8
        });
    }

    static forStarving(gameObjectShape: Container) {
        // #1E7A1E
        return new StatusEffect(StatusEffect.Starving, gameObjectShape, {
            red: 30,
            green: 120,
            blue: 30,
            startAlpha: 0.2,
            endAlpha: 0.8
        });
    }

    static forYielded(gameObjectShape: Container, soundId? : string) {
        return new StatusEffect(StatusEffect.Damaged, gameObjectShape,
            null,
            [ { type: 'shake', from: 15, to: 18 } ],
            { soundId: soundId, options: {
                speed: random(0.8, 0.9),
                volume: random(0.8, 0.9),
            } });
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

        if (this.colorMatrix) {
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
        
        //TODO: These should be part of the "Animation"?
        if (Array.isArray(this.easeEffects)) {
            let ease = new Ease({});
            this.easeEffects.forEach((effect: EaseEffect) => {
                switch (effect.type) {
                    case 'scale':
                        const randomScaleX = this.originalScaleX * effect.from;
                        const randomScaleY = this.originalScaleY * effect.to;

                        ease.add(this.shape.scale, { x: randomScaleX, y: randomScaleY }, { duration: 60, ease: 'easeOutElastic' });

                        ease.once('complete', () => {
                            ease.add(this.shape.scale, { x: this.originalScaleX, y: this.originalScaleY }, { duration: 80, ease: 'easeInBounce' });
                        });
                        break;
                    case 'shake':
                        const shakeIntensity = random( effect.from, effect.to );
                        ease.add(this.shape.position, { shake: shakeIntensity }, { duration: 30, ease: 'easeOutElastic' });
                        break;
                    default:
                        break;
                }
            });
        }

        if (this.soundData){
            const playRoll = this.soundData.chanceToPlay ? Math.random() <= this.soundData.chanceToPlay : true;
            if (playRoll)
                sound.play(this.soundData.soundId, this.soundData.options);
        }
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