'use strict';
import * as Game from './Game';
import {BasicConfig as Constants} from '../config/Basic';
import * as GameMapGenerator from './mapEditor/GameMapGenerator';
import * as MapEditor from './mapEditor/_MapEditor';

export default class GameMap {
    width;
    height;
    objects;

    constructor() {

        if (MapEditor.isActive()) {
            let dimmensions = MapEditor.getMapDimensions();
            this.width = dimmensions.width;
            this.height = dimmensions.height;
        } else {
            this.width = Constants.BASE_MOVEMENT_SPEED;
            this.width *= 60; // FPS
            this.width *= 30; // Required seconds to get across the map

            //noinspection JSSuspiciousNameCombination
            this.height = this.width;
        }

        this.objects = GameMapGenerator.generate(this.width, this.height);
    }

    /**
     * Returns an array of game objects that are currently within the given area.
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     * @return Array
     */
    getObjects(startX, startY, endX, endY) {
        const containedObjects = this.objects.filter(function (gameObject) {
            let x = gameObject.getX();
            let y = gameObject.getY();

            return !(
                x > endX ||
                x < startX ||
                y > endY ||
                y < startY);
        });
        console.log(containedObjects.length + ' objects within ' +
            '[(' + startX.toFixed(0) + '/' + startY.toFixed(0) + ')' +
            '/(' + endX.toFixed(0) + '/' + endY.toFixed(0) + ')] .');
        return containedObjects;
    };

    getObjectsInView() {
        return this.getObjectsInRange(
            Game.player.character.getPosition(),
            Math.min(this.width / 2, this.height / 2),
        )
    };

    getObjectsInRange(position, range) {
        return this.getObjects(
            position.x - range,
            position.y - range,
            position.x + range,
            position.y + range,
        )
    };
}