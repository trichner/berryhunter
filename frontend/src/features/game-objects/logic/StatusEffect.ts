import { ColorMatrixFilter, Container, Ticker } from 'pixi.js';
import { flood } from '../../pixi-js/logic/ColorMatrixFilterExtensions';
import { isDefined, random, randomInt, randomSign } from '../../common/logic/Utils';
import { SoundData } from '../../audio/logic/SoundData';
import { spatialAudio } from '../../audio/logic/SpatialAudio';
import { Vector } from '../../core/logic/Vector';
import { Easing, Tween, Group as TweenGroup } from '@tweenjs/tween.js';

export interface StatusEffectDefinition {
    id: string;
    priority: number;
}

export class ColorMatrixTweenEffect implements TweenEffect {
    type: string;
    from: number;
    to: number;
    duration: number;
    repeat?: boolean;
    red: number;
    green: number;
    blue: number;
    brightness: number;
    greyscale: boolean;
    constructor(red: number, green: number, blue: number, from: number, to: number, duration: number, repeat?: boolean, brightness?: number, greyscale?: boolean) {
        this.type = 'colorMatrix'
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.from = from;
        this.to = to;
        this.duration = duration
        this.repeat = repeat
        this.brightness = brightness
        this.greyscale = greyscale
    }
}

export interface TweenEffect {
    type: string;
    from: number;
    to: number;
    duration: number;
    repeat?: boolean;
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

    private updateFn: () => void;
    showing: boolean = false;
    colorMatrix: ColorMatrixFilter;
    startAlpha: number;
    endAlpha: number;
    shape: Container;
    originalScaleX: number;
    originalScaleY: number;
    tweenEffects: TweenEffect[];
    soundData: SoundData[];
    tweenGroup: TweenGroup;

    private constructor(
        definition: StatusEffectDefinition,
        gameObjectShape: Container,
        tweenEffects: TweenEffect[],
        soundData?: SoundData[]
    ) {
        this.tweenGroup = new TweenGroup();
        this.id = definition.id;
        this.priority = definition.priority;
        this.shape = gameObjectShape;
        this.originalScaleX = this.shape.scale.x;
        this.originalScaleY = this.shape.scale.y;
        tweenEffects.forEach(effect => {
            if (effect instanceof ColorMatrixTweenEffect) {
                if (isDefined(this.colorMatrix)) {
                    console.error("Duplicate ColorMatrixTweenEffects defined in " + this.id + ". Currently, only one is supported.")
                }
                this.colorMatrix = new ColorMatrixFilter();
                flood(this.colorMatrix, effect.red, effect.green, effect.blue, 1);
                if (effect.brightness > 0) this.colorMatrix.brightness(effect.brightness, false);
                if (effect.greyscale) this.colorMatrix.greyscale(1, true);
                this.colorMatrix.alpha = effect.from;
                this.colorMatrix.enabled = false;

                this.startAlpha = effect.from;
                this.endAlpha = effect.to;

                if (Array.isArray(gameObjectShape.filters)) {
                    gameObjectShape.filters = [...gameObjectShape.filters, this.colorMatrix];
                } else {
                    gameObjectShape.filters = [this.colorMatrix];
                }
            }

        });

        this.tweenEffects = tweenEffects;

        if (Array.isArray(soundData)) {
            this.soundData = soundData;
        }

        this.updateFn = () => {
            this.update();
        };
    }

    static forDamaged(gameObjectShape: Container, soundData?: SoundData[]) {
        if (isDefined(soundData)) {
            soundData.push({
                soundId: 'mobHit',
                options: {
                    volume: random(0.3, 0.4),
                    speed: random(0.9, 1.5)
                },
                chanceToPlay: 1
            });
        }
        return new StatusEffect(
            StatusEffect.Damaged,
            gameObjectShape,
            [
                new ColorMatrixTweenEffect(255, 255, 255, 0.4, 1, 200, false, 0, true),
                {type: 'scale', from: 1.1, to: 0.8, duration: 100},
            ],
            soundData,
        );
    }

    static forDamagedOverTime(gameObjectShape: Container, soundData?: SoundData[]) {
        return new StatusEffect(
            StatusEffect.DamagedAmbient,
            gameObjectShape,
            [new ColorMatrixTweenEffect(255, 255, 255, 0, 1, 200, false, 0, true)],
            soundData
        );
    }

    static forFreezing(gameObjectShape: Container) {
        // #125799
        return new StatusEffect(
            StatusEffect.Freezing,
            gameObjectShape,
            [new ColorMatrixTweenEffect(18, 87, 153, 0.4, 0.8, 200)]
        );
    }

    static forStarving(gameObjectShape: Container) {
        // #1E7A1E
        return new StatusEffect(
            StatusEffect.Starving,
            gameObjectShape,
            [new ColorMatrixTweenEffect(30, 120, 30, 0.2, 0.8, 200)]
        );
    }

    static forYielded(gameObjectShape: Container, soundId?: string) {
        return new StatusEffect(
            StatusEffect.Yielded,
            gameObjectShape,
            [{ type: 'shake', from: 4, to: 4, duration: 24 }],
            isDefined(soundId) ? [{
                soundId: soundId, options: {
                    speed: random(0.8, 0.9),
                    volume: random(0.8, 0.9),
                }
            }] : undefined
        );
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
            this.soundData.forEach((sound : SoundData) =>{
                if (!sound || !sound.soundId) return;
                const playRoll = sound.chanceToPlay ? Math.random() <= sound.chanceToPlay : true;
                if (playRoll) {
                    spatialAudio.play(sound.soundId, Vector.clone(this.shape.position), sound.options);
                }
            });
        }

        this.showing = true;
        Ticker.shared.remove(this.updateFn);
        Ticker.shared.add(this.updateFn);
    }

    private buildTweens() {
        this.tweenGroup.removeAll();

        //TODO: These should be part of the "Animation"?

        this.tweenEffects.forEach((effect: TweenEffect) => {
            const repeats = effect.repeat ? Infinity : 1;
            switch (effect.type) {
                case 'colorMatrix': {
                    if (this.colorMatrix) {
                        this.colorMatrix.alpha = this.startAlpha;
                        const colorTween = new Tween(this.colorMatrix);
                        colorTween.to({ alpha: effect.to }, effect.duration)
                            .repeat(repeats)
                            .yoyo(true)
                            .easing(Easing.Elastic.In);
                        this.tweenGroup.add(colorTween);
                        colorTween.onEveryStart(() => {
                            this.colorMatrix.enabled = true;
                        })
                        colorTween.onComplete(() => {

                            this.colorMatrix.enabled = false;
                        })
                        colorTween.onStop(() => {

                            this.colorMatrix.enabled = false;
                        })
                    }
                    break;
                }
                case 'scale': {
                    const randomScaleX = this.originalScaleX * effect.from;
                    const randomScaleY = this.originalScaleY * effect.to;
                    const tween = new Tween(this.shape.scale);
                    tween.to({ x: randomScaleX, y: randomScaleY }, effect.duration)
                        .easing(Easing.Sinusoidal.Out)
                        .repeat(repeats)
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
                        .easing(Easing.Bounce.Out)
                        .repeat(repeats)
                        .yoyo(true);
                    this.tweenGroup.add(tween);
                    break;
                }
                case 'tint': {
                    const tween = new Tween(this.shape);
                    tween.to({ tint: effect.to }, effect.duration)
                        .easing(Easing.Cubic.Out)
                        .repeat(repeats).yoyo(true);
                    this.tweenGroup.add(tween);
                    break;
                }
                default:
                    break;
            }
        });
    }

    update() {
        this.tweenGroup.update();
        if (!this.showing) {
            if (this.tweenGroup.allStopped()) {
                Ticker.shared.remove(this.updateFn);
            }
        }
    }

    stop() {
        Ticker.shared.remove(this.updateFn);
        this.tweenGroup.getAll().forEach(tween => tween.stop());
        this.showing = false;
        this.shape.scale.set(1, 1);
        if (this.colorMatrix) {
            this.colorMatrix.alpha = this.startAlpha;
            this.colorMatrix.enabled = false;
        }
    }

    playFromBeginning() {
        if (this.showing) {
            this.stop();
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
