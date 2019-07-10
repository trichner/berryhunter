'use strict';

import * as Preloading from './Preloading';
import * as Events from './Events';
import {isDefined, map} from './Utils';
import * as UserInterface from './userInterface/UserInterface';
import {InjectedSVG} from './InjectedSVG';
import {GraphicsConfig} from '../config/Graphics';
import {BasicConfig as Constants} from '../config/Basic';
import * as PIXI from 'pixi.js';

let Game = null;

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

    static indicators;
    static damageIndicator = {svg: undefined};
    static hungerIndicator = {svg: undefined};
    static coldnessIndicator = {svg: undefined};


    health: number;
    satiety: number;
    bodyHeat: number;
    previousValues;
    previousValuesLimit: number;
    uiBars;
    indicators;
    damageIndicatorDuration: number;

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

        this.indicators = VitalSigns.indicators;

        // hide all indicators
        Object.values(this.indicators).forEach(function (indicator: { visible: boolean }) {
            indicator.visible = false;
        });

        this.damageIndicatorDuration = 0;

        Game.renderer.on('prerender', this.update, this);
    }

    static setup(game, group) {
        Game = game;

        let indicators = {
            damage: createIndicator(VitalSigns.damageIndicator.svg),
            hunger: createIndicator(VitalSigns.hungerIndicator.svg),
            coldness: createIndicator(VitalSigns.coldnessIndicator.svg),
        };
        VitalSigns.indicators = indicators;

        group.addChild(
            indicators.damage,
            indicators.hunger,
            indicators.coldness
        );
        group.position.set(Game.width / 2, Game.height / 2);
    };

    setHealth(health) {
        this.setValue('health', health);
    }

    setSatiety(satiety) {
        this.setValue('satiety', satiety);
    }

    setBodyHeat(bodyHeat) {
        this.setValue('bodyHeat', bodyHeat);
    }

    setValue(valueIndex, value) {
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
        Events.trigger('vitalSign.change', {
            vitalSign: valueIndex,
            newValue: {
                relative: relativeValue,
                absolute: value
            }
        });
    }

    onDamageTaken(skipFadeIn = false) {
        // 300ms shows the damage indicator
        if (skipFadeIn) {
            this.damageIndicatorDuration = 420;
        } else {
            this.damageIndicatorDuration = 500;
        }
        this.showIndicator('damage', 0);
    }

    updateFromBackend(backendValues) {
        let previousValues = {};
        ['health', 'satiety', 'bodyHeat'].forEach((vitalSign) => {
            if (isDefined(backendValues[vitalSign])) {
                this.setValue(vitalSign, backendValues[vitalSign]);
                previousValues[vitalSign] = backendValues[vitalSign];
            } else {
                previousValues[vitalSign] = this[vitalSign];
            }
        });

        this.previousValues.push(previousValues);
        if (this.previousValues.length > this.previousValuesLimit) {
            this.previousValues.shift();
        }
    }

    update() {
        if (this.damageIndicatorDuration > 0) {
            // Show damage frame
            this.damageIndicatorDuration -= Game.timeDelta;
            if (this.damageIndicatorDuration < 0) {
                this.hideIndicator('damage');
            } else {
                this.hideIndicator('hunger');
                this.hideIndicator('coldness');
                this.showIndicator('damage', getDamageOpacity(this.damageIndicatorDuration));
            }
        } else {
            let indicatorVisible = false;
            let relativeSatiety = this.satiety / VitalSigns.MAXIMUM_VALUES.satiety;
            if (this.showIndicatorBelowThreshold(relativeSatiety, 'hunger')) {
                indicatorVisible = true;
            }

            let relativeBodyHeat = this.bodyHeat / VitalSigns.MAXIMUM_VALUES.bodyHeat;
            if (this.showIndicatorBelowThreshold(relativeBodyHeat, 'coldness')){
                indicatorVisible = true;
            }

            if (!indicatorVisible) {
                this.hideIndicator('hunger');
                this.hideIndicator('coldness');
            }
        }
    }

    private showIndicatorBelowThreshold(relativeVitalSign: number, indicator: string){
        if (relativeVitalSign < GraphicsConfig.vitalSigns.overlayThreshold) {
            let opacity = 1 - (relativeVitalSign / GraphicsConfig.vitalSigns.overlayThreshold);
            this.showIndicator(indicator, opacity);
            return true;
        }

        this.hideIndicator(indicator);
        return false;
    }

    showIndicator(indicatorName, opacity) {
        this.indicators[indicatorName].visible = true;
        this.indicators[indicatorName].filters[0].alpha = opacity;
    }

    hideIndicator(indicatorName) {
        this.indicators[indicatorName].visible = false;
    }

    destroy() {
        Game.renderer.off('prerender', this.update, this);
    }
}

/**
 * 500 - 420ms --> fadeIn
 * 420 - 280ms --> show
 * 280 -   0ms --> fadeOut
 * @param time
 */
function getDamageOpacity(time) {
    if (time > 420) {
        return map(time, 500, 420, 0, 1);
    } else if (time >= 280) {
        return 1;
    } else {
        return map(time, 280, 0, 1, 0);
    }
}


function createIndicator(svgGraphic) {
    let indicatorSprite = new InjectedSVG(svgGraphic, 0, 0, indicatorSize / 2);
    indicatorSprite.width = window.innerWidth;
    indicatorSprite.height = window.innerHeight;
    indicatorSprite.visible = false;
    indicatorSprite.filters = [ new PIXI.filters.AlphaFilter()];

    return indicatorSprite;
}

let indicatorSize = Math.max(window.innerWidth, window.innerHeight);
Preloading.registerGameObjectSVG(VitalSigns.damageIndicator, require('../img/overlays/damage.svg'), indicatorSize);
Preloading.registerGameObjectSVG(VitalSigns.hungerIndicator, require('../img/overlays/hunger.svg'), indicatorSize);
Preloading.registerGameObjectSVG(VitalSigns.coldnessIndicator, require('../img/overlays/coldness.svg'), indicatorSize);
