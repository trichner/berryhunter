import {GameObject} from '../../../game-objects/logic/_GameObject';
import {isDefined, isUndefined} from '../../../common/logic/Utils';
import {IDevelop} from "./IDevelop";
import {Graphics} from 'pixi.js';

let Develop: IDevelop = null;

export interface hasAABB {
    aabb: Graphics;
    aabbConnector: Graphics;
    // updateAABB: (aabb) => void;
    hideAABB: () => void;
    showAABB: () => void;
}

export function setup(develop: IDevelop) {
    Develop = develop;

    GameObject.prototype['updateAABB'] = function (aabb: { LowerX: number; LowerY: number; UpperX: number; UpperY: number; }) {
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

            this.aabb = new Graphics()
                .rect(x, y, width, height)
                .stroke({width: Develop.settings.linewidth, color: Develop.settings.elementColor});

            this.layer.addChild(this.aabb);

            this.aabbConnector = new Graphics()
                .stroke({width: Develop.settings.linewidth, color: Develop.settings.elementColor})
                .moveTo(this.getX(), this.getY())
                .lineTo(x, y);
            this.layer.addChild(this.aabbConnector);

        } else {
            this.aabb.position.set((startX + endX) / 2, (startY + endY) / 2);
        }
    };

    GameObject.prototype['hideAABB'] = function () {
        if (isDefined(this.aabb)) {
            this.aabb.stroke({width: 0, alpha: 0});
        }
    };

    GameObject.prototype['showAABB'] = function () {
        if (isDefined(this.aabb)) {
            this.aabb.stroke({width: Develop.settings.linewidth, color: Develop.settings.elementColor});
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
