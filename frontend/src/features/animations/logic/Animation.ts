import { ListenerFn } from "eventemitter3";
import { Ticker } from 'pixi.js';
import { Tween, Group as TweenGroup } from '@tweenjs/tween.js';

export class Animation {
    private tweenGroup: TweenGroup;
    private updateFn: () => void;
    private ticker: Ticker;
    private onCompleteFunc;

    /**
     * Helper list for multiple animations
     * @param {object} [options]
     * @param {PIXI.ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for the list
     * @param {boolean} [options.autoDestroy=true] whether or not the animation function should be automatically removed once it's done.
     *
     * @event List#done(List) final animation completed in the list
     * @event List#each(elapsed, List) each update after eases are updated
     */
    constructor() {
        this.tweenGroup = new TweenGroup();
    }

    start() {
        this.tweenGroup.getAll().forEach(tween => tween.start());
        this.ticker = Ticker.shared;
        this.updateFn = () => {
            this.tweenGroup.update();
            if (this.tweenGroup.allStopped()) {
                if (this.onCompleteFunc)
                    this.onCompleteFunc();
                Ticker.shared.remove(this.updateFn);
            }
        };
        this.ticker.add(this.updateFn);
    }

    destroy() {
        this.tweenGroup.getAll().forEach(tween => tween.stop());
        this.ticker.remove(this.updateFn);
    }

    add(object, to, options: { duration: number, easing, reverse?: boolean }) {
        let tween = new Tween(object);
        tween.to(to, options.duration)
            .easing(options.easing)
            .yoyo(options.reverse ? true : false)
            .repeat(options.reverse ? 1 : 0);
        this.tweenGroup.add(tween);
        return tween;
    }

    onComplete(onComplete: ListenerFn) {
        this.onCompleteFunc = onComplete;
    }
}
