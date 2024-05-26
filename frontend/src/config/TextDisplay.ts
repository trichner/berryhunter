import _extend = require('lodash/assignIn');
import {TextStyleOptions} from 'pixi.js/lib/scene/text/TextStyle';

export function defaultStyle(): TextStyleOptions {
    return {
        fontFamily: 'stone-age',
        fontSize: 30,
        align: 'center',
        fontVariant: 'small-caps',
        letterSpacing: 2,
    };
}

export function style(additionalStyle: TextStyleOptions): TextStyleOptions {
    return _extend(defaultStyle(), additionalStyle);
}
