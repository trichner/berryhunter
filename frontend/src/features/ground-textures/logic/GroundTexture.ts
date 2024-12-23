import * as PIXI from "pixi.js";
import {createInjectedSVG} from '../../core/logic/InjectedSVG';
import {GroundTextureType} from "./GroundTextureTypes";
import {integer, radians} from "../../common/logic/Types";

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
    graphic: PIXI.Sprite;

    constructor(parameters: Parameters) {
        this.parameters = parameters;
    }

    addToMap(layer: PIXI.Container) {
        this.graphic = createInjectedSVG(
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
