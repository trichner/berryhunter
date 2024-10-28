import * as Preloading from '../../core/logic/Preloading';
import * as UserInterface from '../../user-interface/HUD/logic/UserInterface';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {BasicConfig as Constants} from '../../../client-data/BasicConfig';
import {
    PlayerStartedFreezingEvent,
    PreloadingStartedEvent,
    VitalSignChangedEvent,
} from '../../core/logic/Events';
import {StatusEffect, StatusEffectDefinition} from '../../game-objects/logic/StatusEffect';

export enum VitalSign {
    health = 'health',
    satiety = 'satiety',
    bodyHeat = 'bodyHeat'
}

const OPACITY_STEPS: number = -1; // 32

export type VitalSignValues = { [key in VitalSign]: number };

export class VitalSigns {

    /**
     * All values are 32bit.
     *
     * @type {{health: number, satiety: number, bodyHeat: number}}
     */
    static MAXIMUM_VALUES: VitalSignValues = {
        health: 0xffffffff,
        satiety: 0xffffffff,
        bodyHeat: 0xffffffff,
    };

    private readonly currentValues: VitalSignValues;
    /**
     * Keeps the last X previous values, where X = previousValuesLimit
     */
    private readonly previousValues: { [key in VitalSign]: number[] };
    private readonly previousValuesLimit: number = Math.round(GraphicsConfig.vitalSigns.fadeInMS / Constants.SERVER_TICKRATE);

    private readonly overlayManager: HtmlOverlayManager;

    constructor() {
        this.currentValues = {
            health: VitalSigns.MAXIMUM_VALUES.health,
            satiety: VitalSigns.MAXIMUM_VALUES.satiety,
            bodyHeat: VitalSigns.MAXIMUM_VALUES.bodyHeat,
        };
        this.previousValues = {
            health: [this.currentValues.health],
            satiety: [this.currentValues.satiety],
            bodyHeat: [this.currentValues.bodyHeat],
        };

        this.overlayManager = new HtmlOverlayManager();
    }

    setHealth(health: number) {
        this.setValue(VitalSign.health, health);
    }

    setSatiety(satiety: number) {
        this.setValue(VitalSign.satiety, satiety);
    }

    setBodyHeat(bodyHeat: number) {
        this.setValue(VitalSign.bodyHeat, bodyHeat);
    }

    setValue(valueIndex: VitalSign, newValue: number) {
        const currentValue = this.currentValues[valueIndex];
        const currentRelativeValue = currentValue / VitalSigns.MAXIMUM_VALUES[valueIndex];
        const newRelativeValue = newValue / VitalSigns.MAXIMUM_VALUES[valueIndex];

        this.currentValues[valueIndex] = newValue;

        this.previousValues[valueIndex].push(currentValue);
        if (this.previousValues[valueIndex].length > this.previousValuesLimit) {
            this.previousValues[valueIndex].shift();
        }
        const minPreviousValue = Math.min(...this.previousValues[valueIndex]);
        const maxPreviousValue = Math.max(...this.previousValues[valueIndex]);

        VitalSignChangedEvent.trigger({
            vitalSign: valueIndex,
            previousValue: {
                relative: currentRelativeValue,
                absolute: currentValue,
            },
            previousValues: {
                relative: {
                    min: minPreviousValue / VitalSigns.MAXIMUM_VALUES[valueIndex],
                    max: maxPreviousValue / VitalSigns.MAXIMUM_VALUES[valueIndex],
                },
                absolute: {
                    min: minPreviousValue,
                    max: maxPreviousValue,
                },
            },
            newValue: {
                relative: newRelativeValue,
                absolute: newValue,
            },
        });

        if (valueIndex == VitalSign.bodyHeat && newRelativeValue <= 0 && currentValue > 0) {
            PlayerStartedFreezingEvent.trigger();
        }
    }

    updateFromBackend(backendValues: VitalSignValues, damageState: DamageState) {
        for (const vitalSign in VitalSign) {
            if (backendValues.hasOwnProperty(vitalSign)) {
                this.setValue(vitalSign as VitalSign, backendValues[vitalSign]);
            }
        }

        const displayedStatusEffects: StatusEffectDefinition[] = [];
        switch (damageState) {
            case DamageState.OneTime:
                displayedStatusEffects.push(StatusEffect.Damaged);
                break;
            case DamageState.Continuous:
                displayedStatusEffects.push(StatusEffect.DamagedAmbient);
                break;
        }

        const relativeSatiety = this.currentValues.satiety / VitalSigns.MAXIMUM_VALUES.satiety;
        if (this.showIndicatorBelowThreshold(relativeSatiety, 'hunger')) {
            displayedStatusEffects.push(StatusEffect.Starving);
        }

        const relativeBodyHeat = this.currentValues.bodyHeat / VitalSigns.MAXIMUM_VALUES.bodyHeat;
        if (this.showIndicatorBelowThreshold(relativeBodyHeat, 'coldness')) {
            displayedStatusEffects.push(StatusEffect.Freezing);
        }

        this.overlayManager.onUpdateFromBackend(displayedStatusEffects);


    }

    private showIndicatorBelowThreshold(relativeVitalSign: number, indicator: string) {
        if (relativeVitalSign < GraphicsConfig.vitalSigns.overlayThreshold) {
            // TODO apply opacity to overlays
            // let opacity = 1 - (relativeVitalSign / GraphicsConfig.vitalSigns.overlayThreshold);
            // this.overlayManager.showIndicator(indicator, opacity);
            return true;
        }

        return false;
    }

    destroy() {
        // Nothing to do
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

/*
 * ============================================================================
 * Render overlays in HTML
 */
const htmlFile = require('../assets/vitalSignsOverlay.html');
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

enum OverlayState {
    INVISIBLE,
    FADING_IN,
    VISIBLE,
    FADING_OUT
}

enum Indicators {
    coldness = 'coldness',
    oneShotDamage = 'oneShotDamage',
    continuousDamage = 'continuousDamage',
    hunger = 'hunger'
}

export enum DamageState {
    None = 'None',
    OneTime = 'OneTime',
    Continuous = 'Continuous',
}

class HtmlOverlayManager /*implements IVitalSignsOverlayManager*/ {
    private readonly overlays: { [key in Indicators]: Overlay };

    constructor() {
        this.overlays = {
            coldness: new TransitionedOverlay(rootElement.querySelector('.overlay.coldness')),
            oneShotDamage: new AnimatedOverlay(rootElement.querySelector('.overlay.damage')),
            continuousDamage: new TransitionedOverlay(rootElement.querySelector('.overlay.continuousDamage')),
            hunger: new TransitionedOverlay(rootElement.querySelector('.overlay.hunger')),
        };
    }

    public onUpdateFromBackend(displayedStatusEffects: StatusEffectDefinition[]) {
        if (displayedStatusEffects.length === 0) {
            this.overlays.coldness.hide();
            this.overlays.oneShotDamage.hide();
            this.overlays.continuousDamage.hide();
            this.overlays.hunger.hide();
            return;
        }

        if (displayedStatusEffects.includes(StatusEffect.Damaged)) {
            // Hide continuous damage overlay
            this.overlays.continuousDamage.hideWithoutTransition();
            // Play animation for damage overlay // only starts if not already running
            this.overlays.oneShotDamage.show();
            // else if states.contains(ContinuousDamage)
        } else if (displayedStatusEffects.includes(StatusEffect.DamagedAmbient)) {
            // Fade out hunger overlay // only fades out if visible
            this.overlays.hunger.hide();
            // Fade out cold overlay
            this.overlays.coldness.hide();
            // Fade in continuous damage overlay // only fades in if not already visible
            this.overlays.continuousDamage.show();
        } else {
            // Fade out continuous damage overlay
            this.overlays.continuousDamage.hide();
            // if states.contains(Hunger)
            if (displayedStatusEffects.includes(StatusEffect.Starving)) {
                // Fade in hunger overlay
                this.overlays.hunger.show();
            } else {
                // Fade out hunger overlay
                this.overlays.hunger.hide();
            }
            // if states.contains(Cold)
            if (displayedStatusEffects.includes(StatusEffect.Freezing)) {
                // Fade in cold overlay
                this.overlays.coldness.show();
            } else {
                // Fade out cold overlay
                this.overlays.coldness.hide();
            }
        }
    }
}

interface Overlay {
    isShown(): boolean;

    isHidden(): boolean;

    show(): void;

    hide(): void;

    hideWithoutTransition(): void;
}

class TransitionedOverlay implements Overlay {

    private state: OverlayState;
    private overlayElement: HTMLElement;
    private animation: Animation = null;

    constructor(overlayElement: HTMLElement) {
        this.overlayElement = overlayElement;
        this.overlayElement.classList.add('hidden');
        this.state = OverlayState.INVISIBLE;
    }

    public isShown(): boolean {
        return this.state === OverlayState.FADING_IN ||
            this.state === OverlayState.VISIBLE ||
            this.state === OverlayState.FADING_OUT;
    }

    public isHidden(): boolean {
        return !this.isShown();
    }

    public fadeIn() {
        // if the overlay is hidden, remove the 'hidden' class
        // and fade its opacity from 0 to 100 over 80ms
        if (!this.isHidden()) {
            return;
        }

        this.overlayElement.classList.remove('hidden');
        this.state = OverlayState.FADING_IN;
        this.animation = this.overlayElement.animate([
            {opacity: 0},
            {opacity: 1},
        ], {
            duration: 80,
            fill: 'forwards',
        });
        this.animation.onfinish = () => {
            this.animation = null;
            this.state = OverlayState.VISIBLE;
        };
    }

    public fadeOut() {
        // if the overlay is shown, fade its opacity from the current value to 0 over 150ms
        // then add the class 'hidden' to it
        if (this.state === OverlayState.INVISIBLE || this.state === OverlayState.FADING_OUT) {
            return;
        }

        if (this.state === OverlayState.FADING_IN) {
            this.state = OverlayState.FADING_OUT;
            // Fake fading out by just reversing the current fade in animation;
            this.animation.reverse();
        } else {
            this.state = OverlayState.FADING_OUT;
            this.animation = this.overlayElement.animate([
                {opacity: 1},
                {opacity: 0},
            ], {
                duration: 150,
                fill: 'forwards',
            });
        }

        this.animation.onfinish = () => {
            this.animation = null;
            this.overlayElement.classList.add('hidden');
            this.state = OverlayState.INVISIBLE;
        };
    }

    public hide() {
        this.fadeOut();
    }

    public hideWithoutTransition() {
        // Cancel any transition
        this.overlayElement.getAnimations().forEach(animation => animation.cancel());
        this.overlayElement.classList.add('hidden');
        this.state = OverlayState.INVISIBLE;
    }

    public show() {
        this.fadeIn();
    }
}

class AnimatedOverlay implements Overlay {

    private state: OverlayState;
    private overlayElement: HTMLElement;
    private animation: Animation = null;

    constructor(overlayElement: HTMLElement) {
        this.overlayElement = overlayElement;
        this.overlayElement.classList.add('hidden');
        this.state = OverlayState.INVISIBLE;
    }

    show(): void {
        this.animate();
    }

    public isShown(): boolean {
        return this.state === OverlayState.FADING_IN ||
            this.state === OverlayState.VISIBLE ||
            this.state === OverlayState.FADING_OUT;
    }

    public isHidden(): boolean {
        return !this.isShown();
    }

    public animate() {
        // if no animation currently running --> start it
        // animation goes like this
        //  - fade opacity from 0 to 1 over 80ms
        //  - keep opacity at 1 for 140ms
        //  - fade opacity from 1 to 0 over 280ms

        if (this.animation === null || this.animation.playState === 'finished') {
            this.overlayElement.classList.remove('hidden');
            this.state = OverlayState.FADING_IN;

            // Animate opacity: 0 to 1 over 80ms, stay at 1 for 140ms, then fade to 0 over 280ms
            const fadeInDuration = 80;
            const visibleDuration = 140;
            const fadeOutDuration = 280;
            const totalDuration = fadeInDuration + visibleDuration + fadeOutDuration;
            this.animation = this.overlayElement.animate([
                {opacity: 0},            // Start at opacity 0
                {opacity: 1, offset: (fadeInDuration / totalDuration)}, // Fade in to opacity 1 (at 80ms/360ms)
                {opacity: 1, offset: (visibleDuration / totalDuration)}, // Stay at opacity 1 for a while (140ms total)
                {opacity: 0},             // Fade out to opacity 0 (at 360ms)
            ], {
                duration: totalDuration, // Total duration: 80ms + 140ms + 280ms = 360ms
                fill: 'forwards',
            });

            this.animation.onfinish = () => {
                this.overlayElement.classList.add('hidden');
                this.state = OverlayState.INVISIBLE;
            };
        }
    }

    hide(): void {
        // Nothing to do - either we are already hidden or we are not, but then we still finish the animation
    }

    hideWithoutTransition(): void {
        this.animation.cancel();
        this.overlayElement.classList.add('hidden');
        this.state = OverlayState.INVISIBLE;
    }
}
