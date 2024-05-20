import * as PIXI from 'pixi.js';
import {AddOptions, Ease, EaseParams} from 'pixi-ease';
import {defaultFor} from './Utils';
import _merge = require('lodash/merge');
import {ListenerFn} from "eventemitter3";

export class Animation {
    private ease: Ease;
    private updateFn: () => void;
    private ticker: PIXI.Ticker;

    /**
     * Helper list for multiple animations
     * @param {object} [options]
     * @param {PIXI.ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for the list
     * @param {boolean} [options.autoDestroy=true] whether or not the animation function should be automatically removed once it's done.
     *
     * @event List#done(List) final animation completed in the list
     * @event List#each(elapsed, List) each update after eases are updated
     */
    constructor(options: { ticker?: PIXI.Ticker, autoDestroy?: boolean } = {}) {
        this.ease = new Ease(_merge(options, {useTicker: false}));

        // TODO this sucks - just discard all animations on .destroy()
        this.ticker = options.ticker || PIXI.Ticker.shared;
        this.updateFn = () => {
            // @ts-ignore update is a bit weirdly defined in Ease.list
            this.ease.update(this.ticker.deltaTime * 16.66);
        };
        this.ticker.add(this.updateFn);

        let autoDestroy = defaultFor(options.autoDestroy, true);
        if (autoDestroy) {
            this.on('complete', () => {
                this.destroy();
            });
        }
    }

    destroy() {
        this.ease.destroy();
        this.ticker.remove(this.updateFn);
    }

    add(object: PIXI.DisplayObject, goto: EaseParams, options: AddOptions) {
        return this.ease.add(object, goto, options);
    }

    on(event: string | symbol, callback: ListenerFn, context?: any): this {
        this.ease.on(event, callback);
        return this;
    }
}
