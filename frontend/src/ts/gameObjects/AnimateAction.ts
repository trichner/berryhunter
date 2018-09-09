'use strict';

import {isUndefined, deg2rad} from '../Utils';
import {GraphicsConfig} from '../../config/Graphics';
import * as Ease from 'pixi-ease';

const animationCfg = GraphicsConfig.character.actionAnimation;

const types = {
    swing: undefined,
    stab: undefined,
};

export default function animateAction(hand, type, animation, animationFrame, onDone) {
    if (!this.isPlayerCharacter) {
        console.log('start action animation at frame ' + animationFrame);
    }

    if (isUndefined(animationFrame)) {
        animationFrame = animationCfg.backendTicks;
    }
    let slowmo = 1;
    let overallDuration = animationCfg.duration * slowmo;
    let forwardDuration = overallDuration * animationCfg.relativeDurationForward;
    let start = overallDuration * (1 - (animationFrame + 1) / animationCfg.backendTicks);
    types[type].call(this, hand, animation, overallDuration, forwardDuration, start, onDone);
}

types.swing = function (hand, animation, overallDuration, forwardDuration, start, onDone) {
    animation.to(
        hand,
        {
            x: hand.originalTranslation.x + this.size * 0.6,
        },
        forwardDuration,
        {
            ease: 'easeOutCirc',
        },
    ).time = start;
    animation.to(
        hand,
        {
            y: hand.originalTranslation.y - this.size * 0.6,
        },
        forwardDuration,
        {
            ease: 'easeInCirc',
        },
    ).time = start;
    animation.to(
        hand,
        {
            rotation: deg2rad(-45),
        },
        forwardDuration,
        {
            ease: 'linear',
        },
    ).time = start;

    animation.on('done', function () {
        let animation = new Ease.list();
        let duration = overallDuration - forwardDuration;
        start = Math.max(0, start - forwardDuration);
        animation.to(
            hand,
            {
                x: hand.originalTranslation.x,
            },
            duration,
            {
                ease: 'easeInCirc',
            },
        ).time = start;
        animation.to(
            hand,
            {
                y: hand.originalTranslation.y,
            },
            duration,
            {
                ease: 'easeOutCirc',
            },
        ).time = start;
        animation.to(
            hand,
            {
                rotation: 0,
            },
            duration,
            {
                ease: 'linear',
            },
        ).time = start;

        animation.on('done', function () {
            onDone();
        });
    });
};

types.stab = function (hand, animation, overallDuration, forwardDuration, start, onDone) {
    animation.to(
        hand,
        {
            x: hand.originalTranslation.x + this.size * 0.4,
        },
        forwardDuration,
        {
            ease: 'easeInOutQuad',
        },
    ).time = start;

    animation.on('done', function () {
        let animation = new Ease.list();
        let duration = overallDuration - forwardDuration;
        start = Math.max(0, start - forwardDuration);
        animation.to(
            hand,
            {
                x: hand.originalTranslation.x,
            },
            duration,
            {
                ease: 'linear',
            },
        ).time = start;

        animation.on('done', function () {
            onDone();
        });
    });
};