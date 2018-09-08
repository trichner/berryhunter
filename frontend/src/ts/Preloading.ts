'use strict';

// TODO vendor
import * as PIXI from 'pixi.js';
import {htmlToElement, isNumber, makeRequest} from './Utils';
import {BasicConfig as Constants} from '../config/Basic';
import * as StartScreen from './userInterface/screens/StartScreen';


const promises = [];
let numberOfPromises = 0;
let loadedPromises = 0;

export function executePreload(requires) {
        return loadPartial(StartScreen.htmlFile)
            .then(function () {
                StartScreen.onDomReady();

                requires.forEach(function (dependency) {
                    requireAsPromise(dependency);
                });

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
                })();
            });
    }

export function executeSetup() {

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
        })();
    }

export function requireAsPromise(dependency) {
        return registerPreload(new Promise(function (resolve) {
            require([dependency], function (dependency) {
                resolve(dependency);
            });
        }));
    }

export function registerPreload(preloadingPromise) {
        preloadingPromise.then(function (data) {
            loadedPromises++;
            StartScreen.progress( loadedPromises / numberOfPromises);

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

export function registerPartial(htmlUrl) {
        let preloadingPromise = loadPartial(htmlUrl);
        registerPreload(preloadingPromise);
        return preloadingPromise;
    }

    /**
     * USE WITH CAUTION. Only usable for components involved in loading.
     * @param htmlUrl
     * @returns {Promise}
     */
export function loadPartial(htmlUrl) {
        return makeRequest({
            method: 'GET',
            url: htmlUrl,
        }).then(function (html) {
            switch (document.readyState) {
                case "interactive":
                case "complete":
                    document.body.appendChild(htmlToElement(html));
                    return Promise.resolve();
                case "loading":
                    return new Promise(function (resolve) {
                        document.addEventListener("DOMContentLoaded", function () {
                            document.body.appendChild(htmlToElement(html));
                            resolve();
                        });
                    });
            }
        });
    }



