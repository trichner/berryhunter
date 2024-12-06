import {isDefined, isUndefined} from '../../frontend/src/features/common/logic/Utils';
import _isString = require('lodash/isString');
import _isObject = require('lodash/isObject');
import * as changeCase from 'change-case';
import {itemName, seconds} from "./format";
import itemExtras = require('../data/items/extra-data.json');
import {render} from "./render";
import {ImageConverter} from "./imageConverter";
import {mapFactors, MappedFactor} from "./factors";
const hook = require('node-hook');

// For SVG files just return the file name - the images have to uploaded by hand into the wiki
hook.hook('.svg', (source: string, filename: string) => {
    // \ need to be escaped with another \ to retain them through this temporary js module
    return 'module.exports = "' + filename.replace(/\\/g, '\\\\') + '";';
});

// Special import with the SVG hook in place!
import {ItemsConfig as items} from '../../frontend/src/client-data/Items';
import {ItemConfig} from "../../frontend/src/features/items/logic/Item";

interface ItemExtra {
    ignore: boolean

    name: string,
    iconFile: string,
    type: string,
    subtypes: string[],
    description: string,

    noIcon: boolean,

    // Following values could be present but will be deleted.
    factors: any,
    materials: any
}

let imageConverter = new ImageConverter();

const itemView = Object
    .entries(items)
    .filter(([name, item]: [string, ItemConfig]) => {
        if (itemExtras.hasOwnProperty(name) &&
            itemExtras[name].ignore) {
            return false;
        }

        return true;
    })
    .map(([name, item]: [string, ItemConfig]) => {
        if (isUndefined(item.definition)) {
            console.error('Missing definition');
            return;
        }

        let itemExtra: ItemExtra = itemExtras[name];

        if (isDefined(itemExtra)) {
            delete itemExtra.factors;
            delete itemExtra.materials;
        } else {
            // Dummy object
            itemExtra = {
                description: undefined,
                factors: undefined,
                iconFile: undefined,
                ignore: undefined,
                materials: undefined,
                name: undefined,
                noIcon: undefined,
                type: undefined,
                subtypes: undefined
            };
        }

        let iconFile: string = undefined;
        if (!itemExtra.noIcon) {
            if (isDefined(item['icon']) &&
                _isString(item['icon'].file)) {
                iconFile = imageConverter.convert(item['icon'].file);
            } else {
                console.error('Missing icon file for ' + name);
            }
        }

        let type: string = itemExtra.type || item.definition.type;
        if (_isString(type)) {
            type = changeCase.capitalCase(type);
        } else {
            console.error('Missing definition.type for ' + name);
        }
        delete itemExtra.type;

        let factors: MappedFactor[];
        if (_isObject(item.definition.factors)) {
            factors = mapFactors(item.definition.factors);
        } else {
            console.error('Missing definition.factors for ' + name);
        }

        let craftTime: string = undefined;
        let materials: { item: string, count: number }[] = [];
        let tools: string = undefined;
        let recipe = item.definition.recipe;
        if (_isObject(recipe)) {
            craftTime = seconds(recipe.craftTimeInSeconds);
            if (Array.isArray(recipe.materials)) {
                materials = recipe.materials;
                materials.forEach(material => {
                    material.item = itemName(material.item);
                });
            } else {
                console.error('Missing recipe.materials for ' + name);
            }

            if (Array.isArray( recipe.tools)) {
                let mappedTools = recipe.tools.map(itemName);
                if (mappedTools.length === 1) {
                    tools = mappedTools[0];
                } else {
                    tools = mappedTools.slice(0, mappedTools.length - 1).join(', ');
                    tools += ' or ';
                    tools += mappedTools[mappedTools.length - 1];
                }
            }
        } else {
            // No error as items are allowed to have no recipe
        }

        if (_isString(itemExtra.name)) {
            name = itemExtra.name;
        }
        delete itemExtra.name;

        let itemView = {
            name: itemName(name),
            iconFile: iconFile,
            type: type,
            factors: factors,
            materials: materials,
            tools: tools,
            craftTime: craftTime,
        };

        for (let key in itemExtra) {
            if (itemExtra.hasOwnProperty(key) && isUndefined(itemExtra[key])) {
                delete itemExtra[key];
            }
        }

        Object.assign(itemView, itemExtra);

        if (Array.isArray(itemView['subtypes'])) {
            itemView['subtypes'] = itemView['subtypes'].join(', ');
        }

        return itemView;
    });

// noinspection JSIgnoredPromiseFromCall
render('items.mustache', 'items', itemView, imageConverter);
