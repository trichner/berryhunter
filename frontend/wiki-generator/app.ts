import {isDefined, isUndefined} from '../src/ts/Utils';
import _isString = require('lodash/isString');
import _isObject = require('lodash/isObject');
import * as path from 'path';
import * as changeCase from 'change-case';
import * as Mustache from 'mustache';
import * as fs from 'fs';
import {promises as fsPromises} from 'fs';
import {ItemType} from '../src/ts/items/ItemType';
import {itemName, meter, percentage, perSecond, seconds} from "./format";

const sharp = require('sharp');

const itemExtras = require('./items/extra-data.json');

const hook = require('node-hook');

// For SVG files just return the file name - the images have to uploaded by hand into the wiki
hook.hook('.svg', (source: string, filename: string) => {
    // \ need to be escaped with another \ to retain them through this temporary js module
    return 'module.exports = "' + filename.replace(/\\/g, '\\\\') + '";';
});

// Special import with the SVG hook in place!
import {ItemsConfig as items} from '../src/config/Items';
import {KEYWORD_DATA} from "./mechanics/keywords";


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

// TODO values to explain:
//   vulnerability
//   yield
//   replenishProbabilityPerS
// --> maybe link every factor to it's according mechanic page

function getImageExportName(fileName: string): string {
    return changeCase.pascalCase(path.parse(fileName).name) + '.png';
}

let imagesToConvert: { input: string, output: string }[] = [];

const itemView = Object
    .entries(items)
    .filter(([name, item]) => {
        if (itemExtras.hasOwnProperty(name) &&
            itemExtras[name].ignore) {
            return false;
        }

        return true;
    })
    .map(([name, item]) => {
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
                iconFile = getImageExportName(item['icon'].file);
                imagesToConvert.push({
                    input: item['icon'].file,
                    output: iconFile
                })
            } else {
                console.error('Missing icon file for ' + name);
            }
        }

        let type: string = itemExtra.type || item.definition.type;
        if (_isString(type)) {
            type = changeCase.titleCase(type);
        } else {
            console.error('Missing definition.type for ' + name);
        }
        delete itemExtra.type;

        let factors: { name: string, value: string | number, link: string }[] = [];
        if (_isObject(item.definition.factors)) {
            for (let key in item.definition.factors) {
                let name = changeCase.titleCase(key);
                let value = item.definition.factors[key];
                let mappedValue: string | number = value;
                let link: string = undefined;

                let keyword = KEYWORD_DATA[key];
                if (isDefined(keyword)){
                    if (isDefined(keyword.name)) {
                        name = keyword.name;
                    }

                    if (isDefined(keyword.formatter)){
                        mappedValue = keyword.formatter(value);
                    }

                    link = keyword.link;
                } else {
                    console.error('Unexpected factor "' + key + '"');
                }

                factors.push({
                    name: name,
                    value: mappedValue,
                    link: link
                })

            }
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
                    material.item = itemName(material.item)
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
                    tools += mappedTools[mappedTools.length - 1]
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


fsPromises.readFile(__dirname + '/items.mustache', 'utf8')
    .then((template: string) => {
        return Mustache.render(
            template,
            itemView
        );
    })
    .then((rendered: string) => {
        if (!fs.existsSync(__dirname + '/output')) {
            fs.mkdirSync(__dirname + '/output');
        }

        return fsPromises.writeFile(__dirname + '/output/items.wiki.html', rendered, 'utf8');
    })
    .then(() => {
        if (!fs.existsSync(__dirname + '/output/images')) {
            fs.mkdirSync(__dirname + '/output/images');
        }

        return Promise.all(imagesToConvert.map((imageToConvert) => {
            return sharp(imageToConvert.input)
                .resize({width: 128})
                .png({progressive: true})
                .toFile(__dirname + '/output/images/' + imageToConvert.output)
        }));
    })
    .catch(err => {
        console.error(err);
    })
    .then(() => {
        console.info('Successfully written output to ./output!');
    });
