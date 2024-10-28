import {InventoryChangeMsg, InventorySlotChangedEvent} from "../../../core/logic/Events";

export class SubIcon {
    countElement;
    requiredCount;

    constructor(domElement, itemName, iconPath, requiredCount, count) {
        domElement.classList.remove('hidden');
        domElement.getElementsByClassName('itemIcon').item(0).setAttribute('src', iconPath);
        this.countElement = domElement.getElementsByClassName('count').item(0);
        if (this.countElement !== null) {
            this.requiredCount = requiredCount;
            this.count = count;

            InventorySlotChangedEvent.subscribe((msg: InventoryChangeMsg) => {
                if (msg.itemName == itemName){
                    this.count = msg.newCount;
                }
            });
        }
    }

    get count() {
        return parseInt(this.countElement.textContent);
    }

    set count(count) {
        this.countElement.textContent = Math.max(this.requiredCount - count, 0);
    }
}
