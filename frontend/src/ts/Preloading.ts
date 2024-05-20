import * as PIXI from 'pixi.js';
import {htmlModuleToString, htmlToElement, isNumber} from './Utils';
import {BasicConfig as Constants} from '../config/Basic';
import {PreloadingProgressedEvent, PreloadingStartedEvent, StartScreenDomReadyEvent} from "./Events";


const promises = [];
let numberOfPromises = 0;
let loadedPromises = 0;
let executeResolve: (value: void) => void;

export function executePreload() {
    return new Promise<void>(function (resolve) {
        executeResolve = resolve;
        PreloadingStartedEvent.trigger();
    });
}

StartScreenDomReadyEvent.subscribe(() => {
    let loadCycle = 1;
    /*
     * As preloads have the chance to register new preloads themself, all preloads are loaded recursively.
     */
    return (function waitForPreloads() {
        return new Promise<void>(function (resolve) {
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

export function registerPreload(preloadingPromise: Promise<any>) {
    preloadingPromise.then(function (data) {
        loadedPromises++;
        PreloadingProgressedEvent.trigger(loadedPromises / numberOfPromises);

        return data;
    });
    // add promise to list of promises executed before setup()
    promises.push(preloadingPromise);
    numberOfPromises++;

    return preloadingPromise;
}

export function registerGameObjectSVG(gameObjectClass: {svg: PIXI.Texture}, svgPath: string | { default: string; }, maxSize: number) {
    svgPath = htmlModuleToString(svgPath);
    return registerPreload(
        new Promise(function (resolve, reject) {
            let sourceScale = 1;
            if (isNumber(maxSize)) {
                // Scale sourceScale according to the maximum required graphic size
                sourceScale = sourceScale * (2 * maxSize) / Constants.GRAPHIC_BASE_SIZE;
            }
            gameObjectClass.svg = PIXI.Texture.from(svgPath, {resourceOptions: {scale: sourceScale}});
            gameObjectClass.svg.baseTexture.on('loaded', function () {
                resolve(gameObjectClass.svg);
            });
            gameObjectClass.svg.baseTexture.on('error', function () {
                reject("Error loading texture '" + svgPath + "'");
            });
        }),
    );
}

export function renderPartial(html: (string | {default: string}), onDomReady = () => {}) {
    document.body.appendChild(htmlToElement(htmlModuleToString(html)));
    onDomReady();
}
