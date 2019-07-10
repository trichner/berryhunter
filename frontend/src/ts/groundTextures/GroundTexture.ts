'use strict';

import {InjectedSVG} from '../InjectedSVG';
import * as Events from "../Events";

let Game = null;
Events.on('game.setup', game => {
    Game = game;
});

export class Parameters {
    // TODO
}

export class GroundTexture {
    parameters;
    graphic;

    constructor(parameters) {
        this.parameters = parameters;
    }

    addToMap() {
        this.graphic = new InjectedSVG(
            this.parameters.type.svg,
            this.parameters.x,
            this.parameters.y,
            this.parameters.size / 3,
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
            Game.layers.terrain.textures.addChildAt(this.graphic, 0);
        } else {
            Game.layers.terrain.textures.addChild(this.graphic);
        }
    }

    remove() {
        this.graphic.parent.removeChild(this.graphic);
    }
}
