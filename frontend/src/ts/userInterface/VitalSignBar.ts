export class VitalSignBar {
    domElement;
    indicator;
    previousIndicator;

    /**
     * @param {Element} node
     */
    constructor(node) {
        this.domElement = node;
        this.indicator = node.querySelector('.indicator');
        this.previousIndicator = node.querySelector('.previousIndicator');
    }

    /**
     *
     * @param value 0.0 - 1.0
     * @param previousValue 0.0 - 1.0
     */
    setValue(value, previousValue) {
        this.indicator.style.width = (value * 100).toFixed(2) + '%';
        this.previousIndicator.style.width = (previousValue * 100).toFixed(2) + '%';
    }
}
