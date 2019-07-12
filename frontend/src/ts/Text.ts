'use strict';

import _extend = require('lodash/extend');

export function defaultStyle() {
    return {
        fontFamily: 'stone-age',
        fontSize: 30,
        align: 'center',
        fontVariant: 'small-caps',
        letterSpacing: 2
    };
}

export function style(additionalStyle) {
    return _extend(defaultStyle(), additionalStyle);
}