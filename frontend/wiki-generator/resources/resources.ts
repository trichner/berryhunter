import * as changeCase from 'change-case';
import {ImageConverter} from "../imageConverter";
import {mapFactors} from "../factors";
import {occurrence, size} from "../format";
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
import {resources} from "./resources-data";
import {isUndefined} from "../../src/ts/Utils";

const whitelistedFactors = ['replenishProbabilityPerSecond', 'minimumYield', 'capacity'];
let totalWeight: number = 0;
let imageConverter = new ImageConverter();

resources.forEach(resource => {
    totalWeight += resource.generator.weight;
});

const resourcesView = resources.map((resource) => {
    if (!Array.isArray(resource.graphics) ||
        resource.graphics.length === 0) {
        console.error('Missing graphics for ' + resource.name);
    }

    const definition = resource.produces.definition;
    if (!_isObject(definition)) {
        console.error('Missing definition for produced item of ' + resource.name);
    }

    if (!_isObject(definition.factors)) {
        console.error('Missing definition.factors for ' + resource.name);
    }

    let formattedSize: string = undefined;
    if (_isNumber(definition.body.radius)) {
        formattedSize = size(definition.body.radius, undefined);
    } else {
        formattedSize  = size(definition.body.minRadius, definition.body.maxRadius);
    }

    return Object.assign({}, resource, {
        name: changeCase.titleCase(resource.name),
        graphics: resource.graphics.map(imageConverter.convert.bind(imageConverter)),
        factors: mapFactors(definition.factors).filter(factor => whitelistedFactors.includes(factor.rawName)),
        drops: {
            name: changeCase.titleCase(resource.produces.definition.name),
            image:  imageConverter.convert(resource.produces.icon.file),
        },
        size: formattedSize,
        occurrence: occurrence(resource.generator.weight, totalWeight)
    });
});

render('resources.mustache', 'resources', resourcesView, imageConverter);
