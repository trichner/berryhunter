import * as changeCase from 'change-case';
import {ImageConverter} from "../imageConverter";
import {mapFactor, mapFactors} from "../factors";
import {itemName, meter, occurrence, size} from "../format";
import {render} from "../render";
import _isObject = require('lodash/isObject');
import _isNumber = require('lodash/isNumber');

const hook = require('node-hook');

// For SVG files just return the file name - the images have to uploaded by hand into the wiki
hook.hook('.svg', (source: string, filename: string) => {
    // \ need to be escaped with another \ to retain them through this temporary js module
    return 'module.exports = "' + filename.replace(/\\/g, '\\\\') + '";';
});

// Special import with the SVG hook in place!
import {animals} from "./animals.data";
import {ItemsConfig} from "../../../frontend/src/game-data/Items";
import {isUndefined} from "../../../frontend/src/ts/Utils";

const blacklistedFactors = ['damageFraction'];
let totalWeight: number = 0;
let imageConverter = new ImageConverter();

animals.forEach(animal => {
    totalWeight += animal.definition.generator.weight;
});

const animalsView = animals.map((animal) => {

    const definition = animal.definition;
    if (!_isObject(definition)) {
        console.error('Missing definition for an animal. ' + JSON.stringify(animal));
    }

    const name: string = animal.definition.name;

    if (!_isObject(definition.factors)) {
        console.error('Missing definition.factors for ' + name);
    }

    let drops: { name: string, image: string }[] = [];
    let definedDrops: { item: string, count: number }[] = definition.drops;
    if (Array.isArray(definedDrops)) {
        definedDrops.forEach((drop: { item: string, count: number }) => {
            let itemCfg = ItemsConfig[drop.item];
            if (isUndefined(itemCfg)) {
                console.log('Cannot find item configuration for ' + drop.item + ' drop for ' + name);
                // return;
            }

            let dropName = itemName(drop.item);
            let mappedDrop = {
                text: (drop.count === 1 ? '' : drop.count + 'x ') + dropName,
                name: dropName,
                image: imageConverter.convert(itemCfg.icon.file)
            };
            drops.push(mappedDrop);
        });
    }

    let formattedSize: string = undefined;
    if (_isNumber(definition.body.radius)) {
        formattedSize = size(definition.body.radius, undefined);
    } else {
        formattedSize = size(definition.body.minRadius, definition.body.maxRadius);
    }

    let damage: number | string = undefined;
    if (_isObject(definition.factors) &&
        _isNumber(definition.factors['damageFraction'])) {
        damage = mapFactor('damageFraction', definition.factors['damageFraction']).value;
        damage += ' in ' + meter(definition.body.damageRadius) + ' radius'
    }

    return Object.assign({}, animal, {
        name: changeCase.capitalCase(name),
        graphic: imageConverter.convert(animal.graphic),
        factors: mapFactors(definition.factors).filter(factor => !blacklistedFactors.includes(factor.rawName)),
        drops: drops,
        size: formattedSize,
        damage: damage,
        occurrence: occurrence(animal.definition.generator.weight, totalWeight)
    });
});

render('animals.mustache', 'animals', animalsView, imageConverter);
