'use strict';

import {GameObject} from '../gameObjects/_GameObject';
import {isDefined, isUndefined} from '../Utils';
import * as PIXI from 'pixi.js';

let Develop = null;

export interface hasAABB {
    aabb: PIXI.Graphics;
    aabbConnector: PIXI.Graphics;
    updateAABB: (aabb) => void;
    hideAABB: () => void;
    showAABB: () => void;
}

export function setup(develop) {
    Develop = develop;

    /**
     *
     * @param {{LowerX: number, LowerY: number, UpperX: number, UpperY: number}} aabb
     */
    GameObject.prototype['updateAABB'] = function (aabb) {
        if (!(Develop.settings.showAABBs && //
            aabb && //
            !isUndefined(aabb.LowerX) && //
            !isUndefined(aabb.LowerY) && //
            !isUndefined(aabb.UpperX) && //
            !isUndefined(aabb.UpperY))) {
            return;
        }

        let startX = aabb.LowerX;
        let startY = aabb.LowerY;
        let endX = aabb.UpperX;
        let endY = aabb.UpperY;

        if (isUndefined(this.aabb)) {

            let width = (endX - startX);
            let height = (endY - startY);
            let x = startX + width / 2;
            let y = startY + height / 2;

            this.aabb = new PIXI.Graphics();
            this.layer.addChild(this.aabb);
            this.aabb.lineColor = Develop.settings.elementColor;
            this.aabb.lineWidth = Develop.settings.linewidth;
            this.aabb.drawRect(x, y, width, height);

            this.aabbConnector = new PIXI.Graphics();
            this.layer.addChild(this.aabbConnector);
            this.aabbConnector.lineColor = Develop.settings.elementColor;
            this.aabbConnector.lineWidth = Develop.settings.linewidth;
            this.aabbConnector.moveTo(this.getX(), this.getY());
            this.aabbConnector.lineTo(x, y);
        } else {
            this.aabb.position.set((startX + endX) / 2, (startY + endY) / 2);
        }
    };

    GameObject.prototype['hideAABB'] = function () {
        if (isDefined(this.aabb)) {
            this.aabb.noStroke();
        }
    };

    GameObject.prototype['showAABB'] = function () {
        if (isDefined(this.aabb)) {
            this.aabb.stroke = Develop.settings.elementColor;
            this.aabb.linewidth = Develop.settings.linewidth;
        }
    };

    let super_hide = GameObject.prototype.hide;
    GameObject.prototype.hide = function () {
        super_hide.call(this);

        if (isDefined(this.aabb)) {
            this.aabb.parent.removeChild(this.aabb);
            delete this.aabb;
        }
    };
}