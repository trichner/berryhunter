import {AddOptions, Ease, EaseParams} from 'pixi-ease';
import {defaultFor} from './Utils';
import _merge = require('lodash/merge');
import {ListenerFn} from "eventemitter3";
import {Container, Ticker} from 'pixi.js';

export class Animation {
    private ease: Ease;
    private updateFn: () => void;
    private ticker: Ticker;

    /**
     * Helper list for multiple animations
     * @param {object} [options]
     * @param {PIXI.ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for the list
     * @param {boolean} [options.autoDestroy=true] whether or not the animation function should be automatically removed once it's done.
     *
     * @event List#done(List) final animation completed in the list
     * @event List#each(elapsed, List) each update after eases are updated
     */
    constructor(options: { ticker?: Ticker, autoDestroy?: boolean } = {}) {
        this.ease = new Ease(_merge(options, {useTicker: false}));

        // TODO this sucks - just discard all animations on .destroy()
        this.ticker = options.ticker || Ticker.shared;
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

    add(object: Container, goto: EaseParams, options: AddOptions) {
        return this.ease.add(object, goto, options);
    }

    on(event: string | symbol, callback: ListenerFn, context?: any): this {
        this.ease.on(event, callback, context);
        return this;
    }

    once(event: string | symbol, callback: ListenerFn, context?: any): this {
        this.ease.once(event, callback, context);
        return this;
    }
}
