import {Develop} from '../../internal-tools/develop/logic/_Develop';
import {ColorMatrixFilter, Container, Filter} from 'pixi.js';
import {flood, lumaGreyscale} from '../../pixi-js/logic/ColorMatrixFilterExtensions';
import {isUndefined} from '../../common/logic/Utils';
import {OnDayTimeStartEvent, OnNightTimeStartEvent} from '../../core/logic/Events';
import './DayCycleJuice';

let ticksPerDay: number;
let dayTimeTicks: number;
const hoursPerDay = 24;
/**
 * First hour that is considered "day" in regard to visuals and temperature
 */
const sunriseHour: number = 6;
let sunsetHour: number;
/**
 * Time of color fade on dusk / dawn
 */
const twilightDuration: number = 1.5;

const sunriseStart = sunriseHour - (twilightDuration * 2 / 3);
const sunriseEnd = sunriseHour + (twilightDuration / 3);

let sunsetStart;
let sunsetEnd;

const NightVisuals = {
    SATURATION: 0.4,
    FLOOD_COLOR: {
        red: 107,
        green: 131,
        blue: 185,
    },
    FLOOD_OPACITY: 0.9,
};

let timeOfDay: number;

let filteredContainers: Container[];
let colorMatrix: ColorMatrixFilter;
let filters: Filter[];
let knownIsDay;

/**
 * Initializes the day cycle setup with the specified parameters.
 * 
 * @param ticksPerDay - The number of ticks in a full day cycle.
 * @param dayTimeTicks - The number of ticks that constitute the daytime period.
 * @param pFilteredContainers - An array of PIXI.js Containers to be filtered by the day cycle effects.
 */
export function setup(totalTicksPerDay: number, ldayTimeTicks: number, pFilteredContainers: Container[]) {
    ticksPerDay = totalTicksPerDay;
    dayTimeTicks = ldayTimeTicks;
    sunsetHour = sunriseHour + dayTimeTicks / ticksPerDay * hoursPerDay;
    sunsetStart = sunsetHour - (twilightDuration / 3);
    sunsetEnd = sunsetHour + (twilightDuration * 2 / 3)

    filteredContainers = pFilteredContainers;

    colorMatrix = new ColorMatrixFilter();
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

export function getDays(serverTicks: number) {
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

export function setTimeByTick(tick: number) {
    timeOfDay = (tick % ticksPerDay / ticksPerDay * hoursPerDay + sunriseHour) % hoursPerDay;
    if (Develop.isActive()) {
        Develop.get().logTimeOfDay(getFormattedTime());
    }

    if (knownIsDay != isDay()) {
        if (!isUndefined(knownIsDay)){
            if (isDay()){
                OnDayTimeStartEvent.trigger();
            }
            else {
                OnNightTimeStartEvent.trigger();
            }
        }

        knownIsDay = isDay();
    }

    let opacity = getNightFilterOpacity();
    if (opacity !== lastOpacity) {
        lastOpacity = opacity;

        if (opacity === 0) {
            filteredContainers.forEach((container: Container) => {
                container.filters = null;
            });
        } else {
            filteredContainers.forEach((container: Container) => {
                container.filters = filters;
            });
            /**
             * Opacity: Saturation
             * 0    : 1
             * 0.5  : 0.65
             * 1    : 0.3
             */
            flood(
                colorMatrix,
                NightVisuals.FLOOD_COLOR.red,
                NightVisuals.FLOOD_COLOR.green,
                NightVisuals.FLOOD_COLOR.blue,
                opacity * NightVisuals.FLOOD_OPACITY,
            );
            lumaGreyscale(
                colorMatrix,
                opacity * (1 - NightVisuals.SATURATION),
                true,
            );
        }
    }
}
