'use strict';

/**
 * Item configs are getting loaded.
 *
 */
import * as Environment from '../Environment';
import {isDefined, makeRequest} from '../Utils';
import * as Preloading from '../Preloading';
import {ItemType} from './ItemType';
import {BasicConfig as Constants} from '../../config/Basic';
import {ItemsConfig as Items} from '../../config/Items';
import * as Events from '../Events';
import * as _ from 'lodash';


function validatePlaceable(item) {
    if (item.type !== ItemType.PLACEABLE) {
        // Only placeables are validated here
        return;
    }

    if (!_.isObject(item.placeable)) {
        throw 'Item "' + item.name + '" must define a property "placeable".';
    }

    if (!isDefined(item.placeable.layer)) {
        throw 'Item "' + item.name + '" must define a property "layer" inside "placeable".';
    }

    Events.on('gameSetup', function (Game) {
        let layer = _.property(item.placeable.layer.split('.'))(Game.layers);
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

    // Disable caching
    let cacheBuster = '';
    if (Environment.cachingEnabled()) {
        cacheBuster = '?' + (new Date()).getTime();
    }

    let definitionPath;
    if (Environment.subfolderPath()) {
        definitionPath = '../api/items/';
    } else {
        definitionPath = 'js/item-definitions/'
    }

    for (let itemName in Items) {
        let item = Items[itemName];

        item.name = itemName;

        if (item.icon && item.icon.file) {
            item.icon.path = 'img/items/' + item.icon.file + '.svg' + cacheBuster;
            Preloading.registerSVG(item.icon.path);
        }
        if (item.graphic && item.graphic.file) {
            item.graphic.path = 'img/items/' + item.graphic.file + '.svg' + cacheBuster;
            item.graphic.size = item.graphic.size || Constants.GRAPHIC_BASE_SIZE;
            Preloading.registerGameObjectSVG(item.graphic, item.graphic.path, item.graphic.size);
        }
        if (item.definition) {
            Preloading.registerPreload(makeRequest({
                method: 'GET',
                url: definitionPath + item.definition + '.json' + cacheBuster
            }).then((itemDefinition: any) => {
                itemDefinition = JSON.parse(itemDefinition);
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
                validatePlaceable(item);
            }));
        } else {
            validatePlaceable(item);
        }
    }
})();

export {Items};
