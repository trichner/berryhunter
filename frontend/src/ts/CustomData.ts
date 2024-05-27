import {Container} from 'pixi.js';
import {BasicConfig} from '../config/Basic';

export enum CustomProperty {
    NAME = 'name',
}

export function setCustomData(object: Object, property: CustomProperty, value: any) {
    if (!object.hasOwnProperty('__berryhunter_data')) {
        object['__berryhunter_data'] = {};
    }

    object['__berryhunter_data'][property] = value;
}

export function getCustomData(object: Object, property: CustomProperty) {
    if (!object.hasOwnProperty('__berryhunter_data')) {
        return undefined;
    }

    return object['__berryhunter_data'][property];
}

export function createNameContainer(name: string) : Container {
    let container = new Container();
    container.label = name;
    return container;
}
