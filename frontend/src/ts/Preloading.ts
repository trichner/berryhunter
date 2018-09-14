'use strict';

import * as PIXI from 'pixi.js';
import {htmlToElement, isNumber, makeRequest} from './Utils';
import {BasicConfig as Constants} from '../config/Basic';
import * as Events from './Events';


const promises = [];
let numberOfPromises = 0;
let loadedPromises = 0;
let executeResolve;

export function executePreload() {
    return new Promise(function (resolve) {
        Events.triggerOneTime('preloading.execute');
        executeResolve = resolve;
    });
}

Events.on('startScreen.domReady', () => {
    let loadCycle = 1;
    /*
     * As preloads have the chance to register new preloads themself, all preloads are loaded recursively.
     */
    return (function waitForPreloads() {
        return new Promise(function (resolve) {
            loadCycle++;
            if (promises.length > 0) {
                let promisesToResolve = promises.slice();
                promises.length = 0;
                return Promise.all(promisesToResolve).then(waitForPreloads).then(resolve);
            }
            resolve();
        });
    })().then(executeResolve);
});

export function registerPreload(preloadingPromise) {
    preloadingPromise.then(function (data) {
        loadedPromises++;
        Events.trigger('preloading.progress', loadedPromises / numberOfPromises);

        return data;
    });
    // add promise to list of promises executed before setup()
    promises.push(preloadingPromise);
    numberOfPromises++;

    return preloadingPromise;
}

export function registerSetup(setupPromise) {
    return registerPreload(setupPromise);
}

/**
 * Create xhr promise to load svg
 * @param svgPath
 */
export function registerSVG(svgPath) {
    return registerPreload(makeRequest({
        method: 'GET',
        url: svgPath,
    }));
}

export function registerGameObjectSVG(gameObjectClass, svgPath, maxSize) {
    return registerPreload(
        new Promise(function (resolve, reject) {
            let sourceScale = 1;
            if (isNumber(maxSize)) {
                // Scale sourceScale according to the maximum required graphic size
                sourceScale = sourceScale * (2 * maxSize) / Constants.GRAPHIC_BASE_SIZE;
            }
            gameObjectClass.svg = PIXI.Texture.fromImage(svgPath, undefined, undefined, sourceScale);
            gameObjectClass.svg.baseTexture.on('loaded', function () {
                resolve(gameObjectClass.svg);
            });
            gameObjectClass.svg.baseTexture.on('error', function () {
                reject("Error loading texture '" + svgPath + "'");
            });
        }),
    );
}

export function renderPartial(html, onDomReady = () => {
}) {
    document.body.appendChild(htmlToElement(html));
    onDomReady();
}