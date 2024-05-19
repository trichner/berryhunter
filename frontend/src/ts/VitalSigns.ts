import * as Preloading from './Preloading';
import * as UserInterface from './userInterface/UserInterface';
import {GraphicsConfig} from '../config/Graphics';
import {BasicConfig as Constants} from '../config/Basic';
import {VitalSignBar} from "./userInterface/VitalSignBar";
import {IGame} from "./interfaces/IGame";
import {PreloadingStartedEvent, PrerenderEvent, VitalSignChangedEvent} from "./Events";

let Game: IGame = null;

export enum VitalSign {
    health = 'health',
    satiety = 'satiety',
    bodyHeat = 'bodyHeat'
}

const OPACITY_STEPS: number = -1; // 32

export class VitalSigns {

    /**
     * All values are 32bit.
     *
     * @type {{health: number, satiety: number, bodyHeat: number}}
     */
    static MAXIMUM_VALUES = {
        health: 0xffffffff,
        satiety: 0xffffffff,
        bodyHeat: 0xffffffff,
    };

    health: number;
    satiety: number;
    bodyHeat: number;
    previousValues;
    previousValuesLimit: number;
    uiBars: { [key in VitalSign]: VitalSignBar };
    display: IVitalSignDisplay;

    constructor() {
        this.health = VitalSigns.MAXIMUM_VALUES.health;
        this.satiety = VitalSigns.MAXIMUM_VALUES.satiety;
        this.bodyHeat = VitalSigns.MAXIMUM_VALUES.bodyHeat;

        this.previousValues = [];
        this.previousValuesLimit = Math.round(GraphicsConfig.vitalSigns.fadeInMS / Constants.SERVER_TICKRATE);

        this.uiBars = {
            health: UserInterface.getVitalSignBar('health'),
            satiety: UserInterface.getVitalSignBar('satiety'),
            bodyHeat: UserInterface.getVitalSignBar('bodyHeat'),
        };

        // this.display = new PixiDisplay();
        this.display = new HtmlDisplay();
        this.display.hideAll();

        PrerenderEvent.subscribe(this.update, this);
    }

    static setup(game, group) {
        Game = game;

        // PixiDisplay.setup(game, group);
    };

    setHealth(health: number) {
        this.setValue(VitalSign.health, health);
    }

    setSatiety(satiety: number) {
        this.setValue(VitalSign.satiety, satiety);
    }

    setBodyHeat(bodyHeat: number) {
        this.setValue(VitalSign.bodyHeat, bodyHeat);
    }

    setValue(valueIndex: string, value: number) {
        let previousValue = this[valueIndex];
        this[valueIndex] = value;
        let relativeValue = value / VitalSigns.MAXIMUM_VALUES[valueIndex];

        // If the vital sign increased ...
        if (value > previousValue) {
            // discard all recorded values to make sure the previous values will be correctly shown for the next ticks
            this.previousValues.forEach(function (previousValueObject) {
                // Use the higher value, to ensure that a visible previous value is not discarded
                previousValueObject[valueIndex] = Math.max(value, previousValueObject[valueIndex]);
            });
        }

        // If there are already recorded previous values...
        if (this.previousValues.length > 0) {
            // set the actual previous value to the first recorded value
            previousValue = this.previousValues[0][valueIndex];
        }
        previousValue /= VitalSigns.MAXIMUM_VALUES[valueIndex];
        this.uiBars[valueIndex].setValue(relativeValue, previousValue);
        VitalSignChangedEvent.trigger({
            vitalSign: valueIndex,
            newValue: {
                relative: relativeValue,
                absolute: value
            }
        });
    }

    onDamageTaken(skipFadeIn = false) {
        this.display.onDamageTaken(skipFadeIn);
    }

    updateFromBackend(backendValues) {
        let previousValues = {};
        for (const vitalSign in VitalSign) {
            if (backendValues.hasOwnProperty(vitalSign)) {
                this.setValue(vitalSign, backendValues[vitalSign]);
                previousValues[vitalSign] = backendValues[vitalSign];
            } else {
                previousValues[vitalSign] = this[vitalSign];
            }
        }

        this.previousValues.push(previousValues);
        if (this.previousValues.length > this.previousValuesLimit) {
            this.previousValues.shift();
        }

        this.display.onUpdateFromBackend();
    }

    update() {
        this.display.update(Game.timeDelta);
        if (!this.display.isDamageVisible()) {
            let indicatorVisible = false;
            let relativeSatiety = this.satiety / VitalSigns.MAXIMUM_VALUES.satiety;
            if (this.showIndicatorBelowThreshold(relativeSatiety, 'hunger')) {
                indicatorVisible = true;
            }

            let relativeBodyHeat = this.bodyHeat / VitalSigns.MAXIMUM_VALUES.bodyHeat;
            if (this.showIndicatorBelowThreshold(relativeBodyHeat, 'coldness')) {
                indicatorVisible = true;
            }

            if (!indicatorVisible) {
                this.display.hideIndicator('hunger');
                this.display.hideIndicator('coldness');
            }
        }
    }

    private showIndicatorBelowThreshold(relativeVitalSign: number, indicator: string) {
        if (relativeVitalSign < GraphicsConfig.vitalSigns.overlayThreshold) {
            let opacity = 1 - (relativeVitalSign / GraphicsConfig.vitalSigns.overlayThreshold);
            this.display.showIndicator(indicator, opacity);
            return true;
        }

        this.display.hideIndicator(indicator);
        return false;
    }

    destroy() {
        PrerenderEvent.unsubscribe(this.update);
        this.display.onDestroy();
    }
}

/**
 * Round opacity to 1 of X steps
 * @param opacity 0.0 - 1.0
 */
function getSteppedOpacity(opacity: number) {
    if (OPACITY_STEPS === -1) {
        return opacity;
    }

    return Math.ceil(opacity * OPACITY_STEPS) / OPACITY_STEPS;
}

interface IVitalSignDisplay {
    hideAll(): void;

    onDamageTaken(skipFadeIn: boolean): void;

    update(timeDelta: number): void;

    isDamageVisible(): boolean;

    showIndicator(indicatorName: string, opacity: number): void;

    hideIndicator(indicatorName: string): void;

    onUpdateFromBackend(): void;

    onDestroy(): void;
}

/*
 * ============================================================================
 * Render overlays in PIXI.js
 */

// class PixiDisplay implements IVitalSignDisplay {
//     static indicators: {
//         damage: PIXI.Sprite,
//         hunger: PIXI.Sprite,
//         coldness: PIXI.Sprite,
//     };
//     static damageIndicator: ISvgContainer = {svg: undefined};
//     static hungerIndicator: ISvgContainer = {svg: undefined};
//     static coldnessIndicator: ISvgContainer = {svg: undefined};
//
//     indicators: {
//         damage: PIXI.Sprite,
//         hunger: PIXI.Sprite,
//         coldness: PIXI.Sprite,
//     };
//     damageIndicatorDuration: number;
//
//     constructor() {
//         this.indicators = PixiDisplay.indicators;
//
//         this.damageIndicatorDuration = 0;
//     }
//
//     static setup(game, group: PIXI.Container) {
//         let indicators = {
//             damage: createIndicator(PixiDisplay.damageIndicator.svg),
//             hunger: createIndicator(PixiDisplay.hungerIndicator.svg),
//             coldness: createIndicator(PixiDisplay.coldnessIndicator.svg),
//         };
//         PixiDisplay.indicators = indicators;
//
//         group.addChild(
//             indicators.damage,
//             indicators.hunger,
//             indicators.coldness
//         );
//         group.position.set(game.width / 2, game.height / 2);
//     }
//
//     hideAll(): void {
//         // hide all indicators
//         Object.values(this.indicators).forEach(function (indicator: { visible: boolean }) {
//             indicator.visible = false;
//         });
//     }
//
//     onDamageTaken(skipFadeIn: boolean): void {
//         // 300ms shows the damage indicator
//         if (skipFadeIn) {
//             this.damageIndicatorDuration = 420;
//         } else {
//             this.damageIndicatorDuration = 500;
//         }
//         this.showIndicator('damage', 0);
//     }
//
//     update(timeDelta: number): void {
//         if (!this.isDamageVisible()) {
//             return;
//         }
//
//         this.damageIndicatorDuration -= timeDelta;
//         if (this.damageIndicatorDuration < 0) {
//             this.hideIndicator('damage');
//         } else {
//             this.hideIndicator('hunger');
//             this.hideIndicator('coldness');
//             this.showIndicator('damage', getDamageOpacity(this.damageIndicatorDuration));
//         }
//     }
//
//     isDamageVisible(): boolean {
//         return this.damageIndicatorDuration > 0;
//     }
//
//     showIndicator(indicatorName: string, opacity: number) {
//         opacity = getSteppedOpacity(opacity);
//
//         this.indicators[indicatorName].visible = true;
//         if (this.indicators[indicatorName].filters[0].alpha !== opacity) {
//             this.indicators[indicatorName].filters[0].alpha = opacity;
//         }
//     }
//
//     hideIndicator(indicatorName: string) {
//         this.indicators[indicatorName].visible = false;
//     }
//
//     onUpdateFromBackend(): void {
//         // Nothing to do
//     }
//
//     onDestroy(): void {
//         // Nothing to do
//     }
// }
//
// /**
//  * 500 - 420ms --> fadeIn
//  * 420 - 280ms --> show
//  * 280 -   0ms --> fadeOut
//  * @param time
//  */
// function getDamageOpacity(time) {
//     if (time > 420) {
//         return map(time, 500, 420, 0, 1);
//     } else if (time >= 280) {
//         return 1;
//     } else {
//         return map(time, 280, 0, 1, 0);
//     }
// }
//
// function createIndicator(svgGraphic: PIXI.Texture): PIXI.Sprite {
//     let indicatorSprite = new InjectedSVG(svgGraphic, 0, 0, indicatorSize / 2);
//     indicatorSprite.width = window.innerWidth;
//     indicatorSprite.height = window.innerHeight;
//     indicatorSprite.visible = false;
//     indicatorSprite.filters = [new PIXI.filters.AlphaFilter()];
//
//     return indicatorSprite;
// }
//
// let indicatorSize = roundToNearestPowOfTwo(window.innerWidth) / 3.2;
// Preloading.registerGameObjectSVG(PixiDisplay.damageIndicator, require('../img/overlays/damage.svg'), indicatorSize);
// Preloading.registerGameObjectSVG(PixiDisplay.hungerIndicator, require('../img/overlays/hunger.svg'), indicatorSize);
// Preloading.registerGameObjectSVG(PixiDisplay.coldnessIndicator, require('../img/overlays/coldness.svg'), indicatorSize);

/*
 * ============================================================================
 * Render overlays in HTML
 */

const htmlFile = require('../partials/vitalSigns.html');
let rootElement: HTMLElement;

PreloadingStartedEvent.subscribe(() => {
    Preloading.renderPartial(htmlFile, onDomReady);
});

export function onDomReady() {
    rootElement = document.getElementById('vitalSignsOverlay');
    // Move the overlays under the game UI
    rootElement.remove();
    document.body.insertBefore(rootElement, UserInterface.getRootElement());
}

enum DamageIndicatorState {
    INVISIBLE,
    FADING_IN,
    VISIBLE,
    FADING_OUT
}

class HtmlDisplay implements IVitalSignDisplay {

    private readonly indicators: {
        coldness: HTMLElement,
        damage: HTMLElement,
        hunger: HTMLElement,
    };

    private damageIndicatorState: DamageIndicatorState = DamageIndicatorState.INVISIBLE;
    private isDamageContinuous: boolean;
    private backendTickContainedDamage: boolean = false;
    private readonly transitionendListener: (event: TransitionEvent) => void;

    constructor() {
        this.indicators = {
            coldness: rootElement.querySelector('.overlay.coldness'),
            damage: rootElement.querySelector('.overlay.damage'),
            hunger: rootElement.querySelector('.overlay.hunger')
        };

        this.transitionendListener = () => {
            this.onDamageIndicatorTransitionEnd();
        };
        this.indicators.damage.addEventListener('transitionend', this.transitionendListener);
    }

    hideAll(): void {
        this.hideIndicator('coldness');
        this.hideIndicator('damage');
        this.hideIndicator('hunger');
    }

    isDamageVisible(): boolean {
        // TODO Gameplay test. Do we want to overlay the fadeout with possible other overlays?
        //  Or delay the other overlays until the damage overlay is completely gone.
        return this.damageIndicatorState === DamageIndicatorState.VISIBLE ||
            this.damageIndicatorState === DamageIndicatorState.FADING_IN;
    }

    onDamageTaken(skipFadeIn: boolean): void {
        this.isDamageContinuous = skipFadeIn;
        switch (this.damageIndicatorState) {
            case DamageIndicatorState.INVISIBLE:
                this.indicators.damage.classList.add('active');
                this.damageIndicatorState = DamageIndicatorState.FADING_IN;
                break;
            case DamageIndicatorState.FADING_OUT:
                this.indicators.damage.classList.add('active');
                this.damageIndicatorState = DamageIndicatorState.FADING_IN;
                break;
            case DamageIndicatorState.FADING_IN:
            case DamageIndicatorState.VISIBLE:
                // Nothing to do, already fading in / visible
                break;
        }
        this.backendTickContainedDamage = true;
        this.hideIndicator('coldness');
        this.hideIndicator('hunger');
    }

    onDamageIndicatorTransitionEnd(/*event: TransitionEvent*/) {
        switch (this.damageIndicatorState) {
            case DamageIndicatorState.FADING_IN:
                this.damageIndicatorState = DamageIndicatorState.VISIBLE;
                if (!this.isDamageContinuous) {
                    this.indicators.damage.classList.remove('active');
                    this.damageIndicatorState = DamageIndicatorState.FADING_OUT;
                } else {
                    // via onUpdateFromBackend:
                    //  Wait for next backend update
                    //  if it's not another damage --> start fading out
                }
                break;
            case DamageIndicatorState.FADING_OUT:
                this.damageIndicatorState = DamageIndicatorState.INVISIBLE;
                break;
            default:
                // Something's fucky
                console.error('Invalid state. Damage indicator ended transition but the state is "' +
                    DamageIndicatorState[this.damageIndicatorState] + '"?');
                break;
        }
    }

    onUpdateFromBackend(): void {
        if (!this.backendTickContainedDamage &&
            this.damageIndicatorState === DamageIndicatorState.VISIBLE &&
            this.isDamageContinuous) {
            this.indicators.damage.classList.remove('active');
            this.damageIndicatorState = DamageIndicatorState.FADING_OUT;
        }
        this.backendTickContainedDamage = false;
    }

    update(timeDelta: number): void {
        // Animations are handled via CSS
    }

    showIndicator(indicatorName: string, opacity: number): void {
        opacity = getSteppedOpacity(opacity);

        let indicator = this.getIndicatorByName(indicatorName);
        indicator.classList.remove('hidden');
        indicator.style.opacity = opacity.toString();
    }

    hideIndicator(indicatorName: string): void {
        if (indicatorName === 'damage') {
            this.indicators.damage.classList.remove('active');
            return;
        }

        this.getIndicatorByName(indicatorName).classList.add('hidden');
    }

    getIndicatorByName(indicatorName: string): HTMLElement {
        return this.indicators[indicatorName] as HTMLElement;
    }

    onDestroy(): void {
        this.indicators.damage.removeEventListener('transitionend', this.transitionendListener);
    }
}
