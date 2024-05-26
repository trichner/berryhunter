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

// TODO checkout Container.getChildByLabel / getChildByName
export function createNameContainer(name: string) : Container {
    let container = new Container();
    if (BasicConfig.USE_NAMED_GROUPS) {
        setCustomData(container, CustomProperty.NAME, name);
    }
    return container;
}
