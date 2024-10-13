import { ColorMatrixFilter, Container, Ticker } from 'pixi.js';
import { flood } from '../ColorMatrixFilterExtensions';
import { random, randomInt, randomSign } from '../Utils';
import { SoundData } from '../audio/SoundData';
import { spatialAudio } from '../juice/SpatialAudio';
import { Vector } from '../Vector';
import { Easing, Tween, Group as TweenGroup } from '@tweenjs/tween.js'

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

export interface TweenEffect {
    type: string;
    from: number;
    to: number;
    duration: number;
}

export class StatusEffect implements StatusEffectDefinition {
    static Damaged: StatusEffectDefinition = { id: 'Damaged', priority: 1 };
    static DamagedAmbient: StatusEffectDefinition = { id: 'DamagedAmbient', priority: 2 };
    static Yielded: StatusEffectDefinition = { id: 'Yielded', priority: 3 };
    static Freezing: StatusEffectDefinition = { id: 'Freezing', priority: 4 };
    static Starving: StatusEffectDefinition = { id: 'Starving', priority: 5 };
    static ResourceHit: StatusEffectDefinition = { id: 'Hit', priority: 5 };
    static Regenerating: StatusEffectDefinition = { id: 'Regenerating', priority: 6 };

    static damageColor = 0xBF153A;

    readonly id: string;
    readonly priority: number;

    showing: boolean = false;
    colorMatrix: ColorMatrixFilter;
    startAlpha: number;
    endAlpha: number;
    shape: Container;
    originalScaleX: number;
    originalScaleY: number;
    tweenEffects?: TweenEffect[];
    soundData?: SoundData;
    tweenGroup: TweenGroup

    private constructor(
        definition: StatusEffectDefinition,
        gameObjectShape: Container,
        colorEffect?: ColorEffect,
        easeEffects?: TweenEffect[],
        soundData?: SoundData
    ) {
        this.tweenGroup = new TweenGroup();
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

        this.tweenEffects = easeEffects;

        if (soundData && typeof soundData.soundId === 'string') {
            this.soundData = soundData;
        }
    }

    static forDamaged(gameObjectShape: Container, soundData?: SoundData) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.Damaged, gameObjectShape,
            {
                red: 191,
                green: 21,
                blue: 58,
                startAlpha: 0.8,
                endAlpha: 0.2
            },
            [{ type: 'scale', from: 1.1, to: 0.7, duration: 100 }], soundData);
    }

    static forDamagedOverTime(gameObjectShape: Container, soundData?: SoundData) {
        // #BF153A old Health Bar dark red?
        return new StatusEffect(StatusEffect.DamagedAmbient, gameObjectShape, {
            red: 191,
            green: 21,
            blue: 58,
            startAlpha: 0.8,
            endAlpha: 0.2
        },
            null,
            soundData);
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

    static forYielded(gameObjectShape: Container, soundId?: string) {
        return new StatusEffect(StatusEffect.Damaged, gameObjectShape,
            null,
            [{ type: 'shake', from: 4, to: 8, duration: 20 }],
            {
                soundId: soundId, options: {
                    speed: random(0.8, 0.9),
                    volume: random(0.8, 0.9),
                }
            });
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
        this.buildTweens();
        this.tweenGroup.getAll().forEach(tween => tween.start());

        if (this.soundData) {
            const playRoll = this.soundData.chanceToPlay ? Math.random() <= this.soundData.chanceToPlay : true;
            if (playRoll) {
                spatialAudio.play(this.soundData.soundId, Vector.clone(this.shape.position), this.soundData.options);
            }
        }

        this.showing = true;
    }

    private buildTweens() {
        if (this.colorMatrix) {
            this.colorMatrix.alpha = this.startAlpha;
            const colorTween = new Tween(this.colorMatrix);
            colorTween.to({ alpha: this.endAlpha }, 100)
                .repeat(1)
                .yoyo(true)
                .easing(Easing.Elastic.InOut);
            this.tweenGroup.add(colorTween);
            colorTween.onEveryStart(() => {

                this.colorMatrix.enabled = true;
            })
            colorTween.onComplete(() => {

                this.colorMatrix.enabled = false;
            })
        }

        //TODO: These should be part of the "Animation"?
        if (Array.isArray(this.tweenEffects)) {
            this.tweenEffects.forEach((effect: TweenEffect) => {
                switch (effect.type) {
                    case 'scale': {
                        const randomScaleX = this.originalScaleX * effect.from;
                        const randomScaleY = this.originalScaleY * effect.to;
                        const tween = new Tween(this.shape.scale);
                        tween.to({ x: randomScaleX, y: randomScaleY }, effect.duration)
                            .easing(Easing.Elastic.Out)
                            .repeat(1)
                            .yoyo(true);
                        this.tweenGroup.add(tween);
                        break;
                    }
                    case 'shake': {
                        const tween = new Tween(this.shape.position);
                        tween.to({
                            x: this.shape.position.x + randomInt(effect.from, effect.to) * randomSign(),
                            y: this.shape.position.y + randomInt(effect.from, effect.to) * randomSign()
                        }, effect.duration)
                            .easing(Easing.Elastic.InOut)
                            .repeat(1)
                            .yoyo(true);
                        this.tweenGroup.add(tween);
                        break;
                    }
                    case 'tint': {
                        const tween = new Tween(this.shape);
                        tween.to({ tint: effect.to }, effect.duration)
                            .easing(Easing.Cubic.Out)
                            .repeat(1).yoyo(true);
                        this.tweenGroup.add(tween);
                        break;
                    }
                    default:
                        break;
                }
            });
            Ticker.shared.add(() => {
                this.tweenGroup.update();
            });
        }
    }

    reset() {
        if (this.showing) {
            this.tweenGroup.getAll().forEach(tween => tween.stop());
            this.showing = false;
            this.shape.scale.set(1, 1);
            if (this.colorMatrix) {
                this.colorMatrix.alpha = this.startAlpha;
                this.colorMatrix.enabled = false;

            }
        }
    }

    playFromBeginning() {
        if (this.showing) {
            this.reset();
            this.show();
        }
    }

    hide() {
        if (this.colorMatrix) {
            this.colorMatrix.alpha = this.startAlpha;
            this.colorMatrix.enabled = false;
        }
        this.showing = false;
    }
}