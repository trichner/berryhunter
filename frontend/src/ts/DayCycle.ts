'use strict';

import {ExtendedColorMatrixFilter} from './ExtendedColorMatrixFilter';
import {Develop} from "./develop/_Develop";


const ticksPerDay = 10 * 60 * 30; // 8 Minutes at 30 tps
const hoursPerDay = 24;
/**
 * First hour that is considered "day" in regards of visuals and temperature
 * @type {number}
 */
const sunriseHour = 6;
const sunsetHour = sunriseHour + hoursPerDay / 2;
/**
 * Time of color fade on dusk / dawn
 * @type {number}
 */
const twilightDuration = 1.5;

const sunriseStart = sunriseHour - (twilightDuration * 2 / 3);
const sunriseEnd = sunriseHour + (twilightDuration / 3);

const sunsetStart = sunsetHour - (twilightDuration / 3);
const sunsetEnd = sunsetHour + (twilightDuration * 2 / 3);

const NightVisuals = {
    SATURATION: 0.4,
    FLOOD_COLOR: {
        red: 107,
        green: 131,
        blue: 185
    },
    FLOOD_OPACITY: 0.9,
};

let timeOfDay;

let filteredContainers;
let colorMatrix: ExtendedColorMatrixFilter;
let filters;

export function setup(mainSvgElement, pfilteredContainers) {
    filteredContainers = pfilteredContainers;

    colorMatrix = new ExtendedColorMatrixFilter();
    filters = [colorMatrix];
}

export function getTime() {
    return timeOfDay;
}

export function isDay() {
    return timeOfDay > sunriseHour && timeOfDay < sunsetHour;
}

export function isNight() {
    return !isDay();
}

export function getDays(serverTicks) {
    return serverTicks / ticksPerDay;
}

export function getFormattedTime() {
    let hours = Math.floor(timeOfDay);
    let minutes = Math.round(timeOfDay % 1 * 60);

    let result = '';
    if (hours < 10) {
        result += '0';
    }
    result += hours;
    result += ':';

    if (minutes < 10) {
        result += '0';
    }
    result += minutes;

    if (timeOfDay < sunriseStart) {
        result += ' night';
    } else if (timeOfDay < sunriseEnd) {
        result += ' dawn'; // Morgendämmerung
    } else if (timeOfDay < sunsetStart) {
        result += ' day';
    } else if (timeOfDay < sunsetEnd) {
        result += ' dusk'; // Abendämmerung
    } else {
        result += ' night';
    }

    return result;
}

let lastOpacity = 0;

function getNightFilterOpacity() {
    if (timeOfDay < sunriseStart) {
        return 1;
    } else if (timeOfDay < sunriseEnd) {
        return 1 - (timeOfDay - sunriseStart) / twilightDuration;
    } else if (timeOfDay < sunsetStart) {
        return 0;
    } else if (timeOfDay < sunsetEnd) {
        return (timeOfDay - sunsetStart) / twilightDuration;
    } else {
        return 1;
    }
}

export function setTimeByTick(tick) {
    timeOfDay = (tick % ticksPerDay / ticksPerDay * hoursPerDay + sunriseHour) % hoursPerDay;
    if (Develop.isActive()) {
        Develop.get().logTimeOfDay(getFormattedTime());
    }

    let opacity = getNightFilterOpacity();
    if (opacity !== lastOpacity) {
        lastOpacity = opacity;

        if (opacity === 0) {
            filteredContainers.forEach(function (container) {
                container.filters = null;
            })
        } else {
            filteredContainers.forEach(function (container) {
                container.filters = filters;
            }, this);
            /**
             * Opacity: Saturation
             * 0    : 1
             * 0.5  : 0.65
             * 1    : 0.3
             */
            colorMatrix.flood(
                NightVisuals.FLOOD_COLOR.red,
                NightVisuals.FLOOD_COLOR.green,
                NightVisuals.FLOOD_COLOR.blue,
                opacity * NightVisuals.FLOOD_OPACITY
            );
            colorMatrix.lumaGreyscale(opacity * (1 - NightVisuals.SATURATION), true);
        }
    }
}
