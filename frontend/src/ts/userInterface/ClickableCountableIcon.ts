'use strict';

import ClickableIcon from './ClickableIcon';

export default class ClickableCountableIcon extends ClickableIcon {
    countNode;

    /**
     * @param {Element} node
     */
    constructor(node) {
        super(node);

        this.countNode = this.domElement.querySelector('.count');
    }

    setCount(count) {
        if (count <= 1) {
            this.countNode.classList.add('hidden');
        } else {
            this.countNode.classList.remove('hidden');
            this.countNode.textContent = count;
        }
    }
}
