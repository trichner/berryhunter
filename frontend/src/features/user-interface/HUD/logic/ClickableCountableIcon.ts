import {ClickableIcon} from './ClickableIcon';

export class ClickableCountableIcon extends ClickableIcon {
    private countNode: HTMLElement;

    constructor(node: Element) {
        super(node);

        this.countNode = this.domElement.querySelector('.count');
    }

    setCount(count: number) {
        if (count <= 1) {
            this.countNode.classList.add('hidden');
        } else {
            this.countNode.classList.remove('hidden');
            this.countNode.textContent = String(count);
        }
    }
}
