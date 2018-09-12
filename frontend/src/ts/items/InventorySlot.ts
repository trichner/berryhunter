'use strict';

import * as Game from '../Game';
import * as Equipment from '../items/Equipment';
import {ItemType} from './ItemType';
import * as UserInterface from '../userInterface/UserInterface';
import * as InventoryListeners from './InventoryListeners';
import * as Events from '../Events';
import * as AutoFeed from '../AutoFeed';
import {BerryhunterApi} from '../backend/BerryhunterApi';


export class InventorySlot {
    inventory;
    index;

    item;
    count;
    active;
    activeAutoFeed;

    clickableIcon;

    domElement;
    autoFeedToggle;


    /**
     *
     * @param {Inventory} inventory
     * @param {int} index
     */
    constructor(inventory, index) {
        this.inventory = inventory;
        this.index = index;

        this.item = null;
        this.count = 0;
        this.active = false;
        this.activeAutoFeed = false;

        this.clickableIcon = UserInterface.getInventorySlot(index);

        this.clickableIcon.onLeftClick = this.leftClick.bind(this);

        this.clickableIcon.onRightClick = this.rightClick.bind(this);

        // A bit hacky, but it works...
        this.domElement = this.clickableIcon.domElement.parentElement;
        this.autoFeedToggle = this.domElement.getElementsByClassName('autoFeedToggle').item(0);
        this.autoFeedToggle.addEventListener('click', (event) => {
            event.preventDefault();

            this.activeAutoFeed = !this.activeAutoFeed;
            this.domElement.classList.toggle('activeAutoFeed', this.activeAutoFeed);
            if (this.activeAutoFeed) {
                Events.trigger('autoFeed.activate', {
                    index: this.index,
                    inventorySlot: this
                });
            } else {
                Events.trigger('autoFeed.deactivate');
            }
        });

        // Deactivate AutoFeed for this slot if another slot is activated
        Events.on('autoFeed.activate', (payload) => {
            if (this.activeAutoFeed && payload.index !== this.index) {
                this.activeAutoFeed = false;
                this.domElement.classList.remove('activeAutoFeed');
            }
        });
    }

    leftClick() {
        if (!this.isFilled()) {
            return;
        }

        if (this.inventory.isCraftInProgress()) {
            return;
        }

        switch (this.item.type) {
            case ItemType.EQUIPMENT:
            case ItemType.PLACEABLE:
                let equipmentSlot = Equipment.Helper.getItemEquipmentSlot(this.item);
                if (this.isActive()) {
                    this.deactivate();
                    this.inventory.deactivateSlot(equipmentSlot, true);
                } else {
                    this.inventory.activateSlot(this.index, equipmentSlot);
                }
                break;
            case ItemType.CONSUMABLE:
                Game.player.controls.onInventoryAction(this.item, BerryhunterApi.ActionType.ConsumeItem);
                break;
        }
    }

    rightClick() {
        if (this.inventory.isCraftInProgress()) {
            return;
        }

        if (this.isFilled()) {
            Game.player.controls.onInventoryAction(this.item, BerryhunterApi.ActionType.DropItem);
        }
    }

    /**
     * @param item
     * @param count
     * @return {boolean} whether or not this slot was changed
     */
    setItem(item, count) {
        if (this.item === item && this.count === count) {
            // Nothing to do
            return false;
        }

        if (count === 0) {
            return this.dropItem();
        }

        count = count || 1;
        this.item = item;
        this.clickableIcon.setIconGraphic(item.icon.path, isItemClickable(item));
        if (AutoFeed.isItemSuitable(item)) {
            this.autoFeedToggle.classList.remove('hidden');
        } else {
            this.autoFeedToggle.classList.add('hidden');
        }

        this.setCount(count);

        return true;
    }

    setCount(count) {
        if (this.count !== count) {
            if (this.count < count) {
                Events.trigger('inventory.add', {itemName: this.item.name, change: (count - this.count)});
            } else {
                Events.trigger('inventory.remove', {itemName: this.item.name, change: (count - this.count)});
            }
            this.count = count;
            this.clickableIcon.setCount(count);
            InventoryListeners.notify(this.item.name, count);
        }
    }

    addCount(count) {
        count = count || 1;
        this.setCount(this.count + count);
    }

    /**
     * @return {boolean} whether or not this slot was changed
     */
    dropItem() {
        if (!this.isFilled()) {
            // Nothing to do
            return false;
        }

        this.clickableIcon.removeIconGraphic();
        this.autoFeedToggle.classList.add('hidden');
        if (this.activeAutoFeed) {
            this.activeAutoFeed = false;
            this.domElement.classList.remove('activeAutoFeed');
            Events.trigger('autoFeed.deactivate');
        }

        if (this.isActive()) {
            this.inventory.deactivateSlot(Equipment.Helper.getItemEquipmentSlot(this.item), false);
        }
        this.setCount(0);
        this.item = null;
        this.deactivate();

        return true;
    }

    activate() {
        this.clickableIcon.activate();
        this.active = true;
    }

    deactivate() {
        this.clickableIcon.deactivate();
        this.active = false;
    }

    isActive() {
        return this.active;
    }

    isFilled() {
        return this.item !== null;
    }
}

/**
 *
 * @param item
 */
function isItemClickable(item) {
    // See https://trello.com/c/Te1dzqKd#comment-5b565a43463c9537a185e364
    // switch (item.type) {
    // 	case ItemType.EQUIPMENT:
    // 	case ItemType.PLACEABLE:
    // 	case ItemType.CONSUMABLE:
    // 		return true;
    // }
    //
    // return false;
    return true;
}