import * as PIXI from 'pixi.js';
import * as Ease from 'pixi-ease';
import {defaultFor} from './Utils';
import _merge = require('lodash/merge');

export class Animation extends Ease.list {
    private updateFn: () => void;
    private ticker: PIXI.Ticker;

    /**
     * Helper list for multiple animations
     * @param {object} [options]
     * @param {PIXI.Ticker} [options.ticker=PIXI.Ticker.shared] use this PIXI.ticker for the list
     * @param {boolean} [options.autoDestroy=true] whether or not the animation function should be automatically removed once it's done.
     *
     * @event List#done(List) final animation completed in the list
     * @event List#each(elapsed, List) each update after eases are updated
     */
    constructor(options: { ticker?: PIXI.Ticker, autoDestroy?: boolean } = {}) {
        super(_merge(options, {noTicker: true}));
        this.ticker = options.ticker || PIXI.Ticker.shared;
        this.updateFn = () => {
            // @ts-ignore update is a bit weirdly defined in Ease.list
            this.update(this.ticker.deltaTime * 16.66);
        };
        this.ticker.add(this.updateFn);

        let autoDestroy = defaultFor(options.autoDestroy, true);
        if (autoDestroy) {
            this.on('done', () => {
                this.destroy();
            });
        }
    }

    destroy() {
        this.ticker.remove(this.updateFn);
    }

    /**
     * @param {object} object to animate
     * @param {object} goto - parameters to animate, e.g.: {alpha: 5, scale: {3, 5}, scale: 5, rotation: Math.PI}
     * @param {number} duration - time to run
     * @param {object} [options]
     * @param {number} [options.wait=0] n milliseconds before starting animation (can also be used to pause animation for a length of time)
     * @param {boolean} [options.pause] start the animation paused
     * @param {boolean|number} [options.repeat] true: repeat animation forever n: repeat animation n times
     * @param {boolean|number} [options.reverse] true: reverse animation (if combined with repeat, then pulse) n: reverse animation n times
     * @param {Function} [options.load] loads an animation using an .save() object note the * parameters below cannot be loaded and must be re-set
     * @param {string|Function} [options.ease] name or function from easing.js (see http://easings.net for examples)
     * @emits to:done animation expires
     * @emits to:wait each update during a wait
     * @emits to:first first update when animation starts
     * @emits to:each each update while animation is running
     * @emits to:loop when animation is repeated
     * @emits to:reverse when animation is reversed
     */
    to(object, goto, duration, options) {
        return super.to(object, goto, duration, options);
    }

    on(event, callback) {
        super.on(event, callback);
    }
}