/**
 * Item configs are getting loaded.
 *
 */
import {isDefined} from '../Utils';
import * as Preloading from '../Preloading';
import {ItemType} from './ItemType';
import {BasicConfig as Constants} from '../../client-data/BasicConfig';
import {ItemsConfig as Items} from '../../client-data/Items';
import {GameLateSetupEvent} from '../Events';
import {IGame} from "../interfaces/IGame";
import _isObject = require('lodash/isObject');
import _property = require('lodash/property');


function validatePlaceable(item) {
    if (item.type !== ItemType.PLACEABLE) {
        // Only placeables are validated here
        return;
    }

    if (!_isObject(item.placeable)) {
        throw 'Item "' + item.name + '" must define a property "placeable".';
    }

    if (!isDefined(item.placeable.layer)) {
        throw 'Item "' + item.name + '" must define a property "layer" inside "placeable".';
    }

    GameLateSetupEvent.subscribe((game: IGame) => {
        let layer = _property(item.placeable.layer.split('.'))(game.layers);
        if (!isDefined(layer)) {
            throw 'The defined layer "' + item.placeable.layer + '" in the item "' + item.name + '" is not valid layer. Check out Game.js for a definition of all game layers.';
        }
        item.placeable.layer = layer;
    });

    if (!isDefined(item.placeable.visibleOnMinimap)) {
        item.placeable.visibleOnMinimap = false;
    }
}

(function preloadItemIcons() {

    for (let itemName in Items) {
        let item = Items[itemName];

        item.name = itemName;

        if (item.graphic && item.graphic.file) {
            item.graphic.size = item.graphic.size || Constants.GRAPHIC_BASE_SIZE;
            Preloading.registerGameObjectSVG(item.graphic, item.graphic.file, item.graphic.size);
        }
        if (item.definition) {
            let itemDefinition = item.definition;
            if (item.name !== itemDefinition.name) {
                throw 'Loaded "' + item.definition + '.json" for item "' + item.name + '" but got "' + itemDefinition.name + '".';
            }
            if (item.type !== ItemType[itemDefinition.type]) {
                console.warn(item.definition + '.json specifies item type "' + ItemType[itemDefinition.type] + ' but Item.js specifies "' + item.type + '. JSON file overrides!');
                item.type = ItemType[itemDefinition.type];
            }

            item.id = itemDefinition.id;
            item.recipe = itemDefinition.recipe;
            item.factors = itemDefinition.factors;
            delete item.definition;
        }
        validatePlaceable(item);
    }
})();

export {Items};
