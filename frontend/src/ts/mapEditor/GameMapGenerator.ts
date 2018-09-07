'use strict';

import {Quadrants} from './Quadrants';
import * as Resources from '../gameObjects/Resources';
import * as Mobs from '../gameObjects/Mobs';
import {executeRandomFunction, randomInt} from '../Utils';

//noinspection UnnecessaryLocalVariableJS
export function generateFromQuadrants() {
    let objects = [];

    const gridSpacing = 100;
    Quadrants.forEach(function (quadrant, index) {
        let offsetX = index * 8 * gridSpacing;
        //TODO "Zeilenumrbrüche" wenn mehr Quadranten als Kartenbreite
        // TODO Quadranten möglichst quadratisch auslegen, statt alle in die Breite
        let offsetY = 0;

        quadrant.forEach(function (field) {
            let rx = offsetX + field.x * gridSpacing - gridSpacing / 2;
            let ry = offsetY + field.y * gridSpacing - gridSpacing / 2;

            let gameObjectClass = field.object;
            switch (gameObjectClass) {
                case Resources.Tree:
                    gameObjectClass = executeRandomFunction([
                        {
                            weight: 5,
                            func: () => {
                                return Resources.RoundTree;
                            }
                        }, {
                            weight: 1,
                            func: () => {
                                return Resources.MarioTree;
                            }
                        }
                    ]);
                    break;
                case Mobs.Mob:
                    gameObjectClass = executeRandomFunction([
                        {
                            weight: 3,
                            func: () => {
                                return Mobs.Dodo;
                            }
                        }, {
                            weight: 1,
                            func: () => {
                                return Mobs.SaberToothCat;
                            }
                        }
                        // }, {
                        // 	weight: 1,
                        // 	func: () => {
                        // 		return new Mammoth(rx, ry);
                        // 	}
                        // }
                    ]);
                    break;
            }
            objects.push(new gameObjectClass(rx, ry));
        }, this);
    }, this);

    return objects;
}

/**
 * Most simple generator for now
 */
export function generate(width, height) {
    // return this.generateFromQuadrants(width, height);

    let objects = [];

    for (let x = 0; x <= width; x += 500) {
        for (let y = 0; y <= height; y += 500) {
            let rx = x + randomInt(-150, 150);
            let ry = y + randomInt(-150, 150);

            // for (let x = 0; x <= width; x += 100) {
            // 	for (let y = 0; y <= height; y += 100) {
            // let rx = x;
            // let ry = y;

            let gameObject = executeRandomFunction([
                {
                    weight: 40,
                    func: () => {
                        return executeRandomFunction([
                            {
                                weight: 5,
                                func: () => {
                                    return new Resources.RoundTree(rx, ry);
                                }
                            }, {
                                weight: 1,
                                func: () => {
                                    return new Resources.MarioTree(rx, ry);
                                }
                            }
                        ]);
                    }
                }, {
                    weight: 5,
                    func: () => {
                        return new Resources.Stone(rx, ry);
                    }
                }, {
                    weight: 5,
                    func: () => {
                        return new Resources.BerryBush(rx, ry);
                    }
                }, {
                    weight: 1,
                    func: () => {
                        return new Resources.Bronze(rx, ry);
                    }
                }, {
                    weight: 10,
                    func: () => {
                        return executeRandomFunction([
                            {
                                weight: 3,
                                func: () => {
                                    return new Mobs.Dodo(rx, ry);
                                }
                            }, {
                                weight: 1,
                                func: () => {
                                    return new Mobs.SaberToothCat(rx, ry);
                                }
                            }
                            // }, {
                            // 	weight: 1,
                            // 	func: () => {
                            // 		return new Mammoth(rx, ry);
                            // 	}
                            // }
                        ]);
                    }
                }
            ]);
            objects.push(gameObject);
        }
    }

    return objects;
}
