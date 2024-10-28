import {Container} from 'pixi.js';

export enum CustomProperty {
    NAME = 'name',
}

export function createNamedContainer(name: string) : Container {
    let container = new Container();
    container.label = name;
    return container;
}
