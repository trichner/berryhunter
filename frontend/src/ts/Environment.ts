'use strict';

import {getUrlParameter} from './Utils';
import {BasicConfig as Constants} from '../config/Basic';


export function cachingEnabled() {
    return window.location.host !== 'localhost:63342' && !getUrlParameter(Constants.MODE_PARAMETERS.SUPPRESS_CACHE_BUSTER);
}

/**
 * Use it to Disable caching
 */
export function getCacheBuster() {
    if (this.cachingEnabled()) {
        return '?' + (new Date()).getTime();
    }

    return '';
}

export function subfolderPath() {
    return window.location.pathname.includes('/frontend/');
}