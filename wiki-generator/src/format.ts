import * as changeCase from 'change-case';
import {isUndefined} from "../../frontend/src/features/common/logic/Utils";

export function percentage(value: number): string {
    return (value * 100).toFixed(0) + '%';
}

export function seconds(value: number): string {
    return value.toFixed(0) + 's';
}

export function perSecond(value: any): string {
    return value + ' per s';
}

export function meter(value: number): string {
    return value.toFixed(1) + 'm';
}

export function itemName(itemName: string) {
    return changeCase.capitalCase(itemName);
}

export function chance(value: number): string {
    return (value * 100).toFixed(0) + '% chance';
}

export function size(minValue: number, maxValue: number) {
    if (isUndefined(minValue) && isUndefined(maxValue)) {
        return undefined;
    }

    if (isUndefined(minValue)){
        return meter(maxValue);
    }

    if (isUndefined(maxValue)){
        return meter(minValue);
    }

    return minValue.toFixed(1) + ' - ' + maxValue.toFixed(1) + 'm';
}

export function occurrence(probabilityWeight: number, totalWeight: number) {
    return (probabilityWeight / totalWeight * 100).toFixed(0) + ' in 100';
}
