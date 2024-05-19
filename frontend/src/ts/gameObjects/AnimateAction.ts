import {deg2rad} from '../Utils';
import {GraphicsConfig} from '../../config/Graphics';
import {Animation} from "../Animation";
import _merge = require('lodash/merge');

const animationCfg = GraphicsConfig.character.actionAnimation;

interface Hand {
    x: number;
    y: number;
    originalTranslation: { x: number, y: number }
}

export const types = {
    swing: undefined,
    stab: undefined,
};

export function animateAction(options: { hand: Hand, type?: 'swing' | 'stab', animation: Animation, animationFrame?: number, onDone?: () => any, size: number, mirrored?: boolean }) {
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

types.swing = function (options, overallDuration, forwardDuration, start) {
    options.animation.to(
        options.hand,
        {
            x: options.hand.originalTranslation.x + options.size * 0.6,
        },
        forwardDuration,
        {
            ease: 'easeOutCirc',
        },
    ).time = start;
    options.animation.to(
        options.hand,
        {
            y: options.hand.originalTranslation.y + options.size * (options.mirrored ? +0.6 : -0.6),
        },
        forwardDuration,
        {
            ease: 'easeInCirc',
        },
    ).time = start;
    options.animation.to(
        options.hand,
        {
            rotation: deg2rad(-45),
        },
        forwardDuration,
        {
            ease: 'linear',
        },
    ).time = start;

    options.animation.on('done', function () {
        let animation = new Animation();
        let duration = overallDuration - forwardDuration;
        start = Math.max(0, start - forwardDuration);
        animation.to(
            options.hand,
            {
                x: options.hand.originalTranslation.x,
            },
            duration,
            {
                ease: 'easeInCirc',
            },
        ).time = start;
        animation.to(
            options.hand,
            {
                y: options.hand.originalTranslation.y,
            },
            duration,
            {
                ease: 'easeOutCirc',
            },
        ).time = start;
        animation.to(
            options.hand,
            {
                rotation: 0,
            },
            duration,
            {
                ease: 'linear',
            },
        ).time = start;

        animation.on('done', function () {
            options.onDone();
        });
    });
};

types.stab = function (options, overallDuration, forwardDuration, start) {
    options.animation.to(
        options.hand,
        {
            x: options.hand.originalTranslation.x + options.size * 0.5,
        },
        forwardDuration,
        {
            ease: 'easeInOutQuad',
        },
    ).time = start;

    options.animation.on('done', function () {
        let animation = new Animation();
        let duration = overallDuration - forwardDuration;
        start = Math.max(0, start - forwardDuration);
        animation.to(
            options.hand,
            {
                x: options.hand.originalTranslation.x,
            },
            duration,
            {
                ease: 'linear',
            },
        ).time = start;

        animation.on('done', function () {
            options.onDone();
        });
    });
};
