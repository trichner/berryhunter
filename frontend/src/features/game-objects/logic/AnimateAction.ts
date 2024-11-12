import {deg2rad} from '../../../old-structure/Utils';
import {GraphicsConfig} from '../../../client-data/Graphics';
import {Animation} from "../../animations/logic/Animation";
import _merge = require('lodash/merge');
import { Hand } from './Character';
import { Easing } from '@tweenjs/tween.js';

const animationCfg = GraphicsConfig.character.actionAnimation;

export const types = {
    swing: undefined,
    swing2: undefined,
    stab: undefined,
};

interface AnimationActionOptions {
    hand: Hand;
    type?: keyof typeof types;
    animation: Animation;
    animationFrame?: number;
    onDone?: () => any;
    size: number;
    mirrored?: boolean;
}
const lerp = (a, b, t) => a + t * (b - a);

export function animateAction(options: AnimationActionOptions) {
    options = _merge({
        mirrored: false,
        type: 'stab',
        animationFrame: GraphicsConfig.character.actionAnimation.backendTicks - 1,
        onDone: () => {}
    }, options);

    let overallDuration = animationCfg.duration;
    let forwardDuration = overallDuration * animationCfg.relativeDurationForward;
    let start = overallDuration * (1 - (options.animationFrame + 1) / animationCfg.backendTicks);
    types[options.type](options, overallDuration, forwardDuration, start);
}

types.swing = function (options: AnimationActionOptions, overallDuration: number, forwardDuration: number, start: number) {
    //TODO: evaluate "start"
    let distanceFactor = options.size;
    let startRotation = options.hand.originalRotation;
    let startX = options.hand.originalTranslation.x;
    let startY = options.hand.originalTranslation.y;
    let controlX = startX + distanceFactor * 0.5; // Control point X (P1) - adjust for direction
    let controlY = startY + distanceFactor * 0.4 * (options.mirrored ? -1 : 1); // Control point Y (P1) - adjust for outward curve
    let endX = startX + distanceFactor * 1; // End point X (P2)
    let endY = startY - distanceFactor * 1 * (options.mirrored ? -1 : 1); // End point Y (P2
    options.animation.add(
        { t: start},
        { t: 1},
        {
            duration: forwardDuration,
            easing: Easing.Circular.Out,
            reverse: true,
        },
    )
    .onUpdate(function (object) {
        let t = object.t;
        let x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
        let y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
        options.hand.container.group.x = x;
        options.hand.container.group.y = y;
        options.hand.container.group.rotation = lerp(startRotation, deg2rad(-45), t);
    })
    .onComplete(function () {
        options.hand.container.group.x = startX;
        options.hand.container.group.y = startY;
        options.hand.container.group.rotation = startRotation;
    });
    options.animation.start();
    options.animation.onComplete(options.onDone);
};

types.stab = function (options: AnimationActionOptions, overallDuration: number, forwardDuration: number, start: number) {
    // TODO use "start", duration is too long
    let distanceFactor = 1;
    options.hand.container.group.x = options.hand.originalTranslation.x;
    options.hand.container.group.y = options.hand.originalTranslation.y;
    options.animation.add(
        options.hand.container.group,
        {
            x: options.hand.originalTranslation.x + options.size * distanceFactor,
        },
        {
            duration: forwardDuration,
            easing: Easing.Quadratic.InOut,
            reverse: true,
        },
    )
    .onComplete(function () {
        options.hand.container.group.x = options.hand.originalTranslation.x;
        options.hand.container.group.y = options.hand.originalTranslation.y;
    });
    options.animation.start();
    options.animation.onComplete(options.onDone);
};
