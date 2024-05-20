import {deg2rad} from '../Utils';
import {GraphicsConfig} from '../../config/Graphics';
import {Animation} from "../Animation";
import _merge = require('lodash/merge');

const animationCfg = GraphicsConfig.character.actionAnimation;

export const types = {
    swing: undefined,
    stab: undefined,
};

interface AnimationActionOptions {
    hand: PIXI.DisplayObject & {originalTranslation: { x: number, y: number }};
    type?: keyof typeof types;
    animation: Animation;
    animationFrame?: number;
    onDone?: () => any;
    size: number;
    mirrored?: boolean;
}

export function animateAction(options: AnimationActionOptions) {
    options = _merge({
        mirrored: false,
        type: 'stab',
        animationFrame: GraphicsConfig.character.actionAnimation.backendTicks - 1,
        onDone: () => {}
    }, options);

    let slowmo = 1;
    let overallDuration = animationCfg.duration * slowmo;
    let forwardDuration = overallDuration * animationCfg.relativeDurationForward;
    let start = overallDuration * (1 - (options.animationFrame + 1) / animationCfg.backendTicks);
    types[options.type](options, overallDuration, forwardDuration, start);
}

types.swing = function (options: AnimationActionOptions, overallDuration: number, forwardDuration: number, start: number) {
    options.animation.add(
        options.hand,
        {
            x: options.hand.originalTranslation.x + options.size * 0.6,
        },
        {
            duration: forwardDuration,
            ease: 'easeOutCirc',
            reverse: true,
        },
    );
    options.animation.add(
        options.hand,
        {
            y: options.hand.originalTranslation.y + options.size * (options.mirrored ? +0.6 : -0.6),
        },
        {
            duration: forwardDuration,
            ease: 'easeInCirc',
            reverse: true,
        },
    );
    options.animation.add(
        options.hand,
        {
            rotation: deg2rad(-45),
        },
        {
            duration: forwardDuration,
            ease: 'linear',
            reverse: true,
        },
    );

    options.animation.on('complete', options.onDone);
};

types.stab = function (options: AnimationActionOptions, overallDuration: number, forwardDuration: number, start: number) {
    options.animation.add(
        options.hand,
        {
            x: options.hand.originalTranslation.x + options.size * 0.5,
        },
        {
            duration: forwardDuration,
            ease: 'easeInOutQuad',
            reverse: true,
        },
    );

    options.animation.on('complete', options.onDone);
};
