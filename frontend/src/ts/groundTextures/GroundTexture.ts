import {InjectedSVG} from '../InjectedSVG';
import * as PIXI from "pixi.js";
import {GroundTextureType} from "./GroundTextureTypes";
import {integer, radians} from "../interfaces/Types";

export interface Parameters {
    type: GroundTextureType,
    x: integer,
    y: integer,
    size: integer,
    rotation: radians,
    flipped: 'none' | 'horizontal' | 'vertical',
    stacking: 'bottom' | 'top'
}

export class GroundTexture {
    parameters: Parameters;
    graphic;

    constructor(parameters: Parameters) {
        this.parameters = parameters;
    }

    addToMap(layer: PIXI.Container) {
        this.graphic = new InjectedSVG(
            this.parameters.type.svg,
            this.parameters.x,
            this.parameters.y,
            this.parameters.size,
            this.parameters.rotation);

        switch (this.parameters.flipped.toLowerCase()) {
            case 'horizontal':
                this.graphic.scale.x *= -1;
                break;
            case 'vertical':
                this.graphic.scale.y *= -1;
                break;
        }

        if (this.parameters.stacking === 'bottom') {
            layer.addChildAt(this.graphic, 0);
        } else {
            layer.addChild(this.graphic);
        }
    }

    remove() {
        this.graphic.parent.removeChild(this.graphic);
    }
}
