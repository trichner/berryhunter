import {VitalSign} from '../VitalSigns';
import {VitalSignChangedEvent} from '../Events';

export class VitalSignBar {
    private readonly vitalSign: VitalSign;
    private readonly indicator: HTMLElement;
    private readonly negativeDeltaIndicator: HTMLElement;
    private readonly positiveDeltaIndicator: HTMLElement;

    constructor(node: HTMLElement, vitalSign: VitalSign) {
        this.vitalSign = vitalSign;
        this.indicator = node.querySelector('.indicator');
        this.negativeDeltaIndicator = node.querySelector('.negativeDeltaIndicator');
        this.positiveDeltaIndicator = node.querySelector('.positiveDeltaIndicator');

        VitalSignChangedEvent.subscribe(payload => {
            if (payload.vitalSign !== this.vitalSign) return;

            this.setValue(payload.newValue.relative, payload.previousValues.relative.min, payload.previousValues.relative.max);
        });
    }

    /**
     *
     * @param value 0.0 - 1.0
     * @param minPreviousValue 0.0 - 1.0
     * @param maxPreviousValue 0.0 - 1.0
     */
    setValue(value: number, minPreviousValue: number, maxPreviousValue: number) {
        const indicatorWidth = (value * 100).toFixed(2) + '%';
        this.indicator.style.scale = indicatorWidth + ' 1';

        if (value < maxPreviousValue) {
            this.negativeDeltaIndicator.classList.remove('hidden');
            // translate: x y --> y is always 0
            this.negativeDeltaIndicator.style.translate = indicatorWidth + ' 0';
            // scale: x y --> y is always 1.0
            this.negativeDeltaIndicator.style.scale = ((maxPreviousValue - value)).toFixed(4) + ' 1.0';
        } else {
            this.negativeDeltaIndicator.classList.add('hidden');
        }
        if (value > minPreviousValue) {
            // We want the
            const baseValue = Math.min(value, maxPreviousValue);
            this.positiveDeltaIndicator.classList.remove('hidden');
            // translate: x y --> y is always 0
            this.positiveDeltaIndicator.style.translate = (minPreviousValue * 100).toFixed(2) + '% 0';
            // scale: x y --> y is always 1.0
            this.positiveDeltaIndicator.style.scale = ((value - minPreviousValue)).toFixed(4) + ' 1.0';
        } else {
            this.positiveDeltaIndicator.classList.add('hidden');
        }
    }
}
