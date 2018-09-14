'use strict';

import * as Events from './Events';
import {GraphicsConfig} from '../config/Graphics';
import {dateDiff, playCssAnimation} from './Utils';
import * as _ from 'lodash';
import {BerryhunterApi} from './backend/BerryhunterApi';

let Game = null;
Events.on('game.setup', game => {
    Game = game;
});

export let activeInventorySlot = null;
export let lastAutoFeed = Date.now();

export function activate(payload) {
    activeInventorySlot = payload.inventorySlot;
}

export function deactivate() {
    activeInventorySlot = null;
}

export function checkChangedVitalSign(payload) {
    // If there's no slot, auto feed is not active
    if (activeInventorySlot === null) {
        return;
    }

    // Check if enough time is elapsed before the Auto feed triggers again.
    // This is mainly to prevent the auto feed being triggered more than once before
    // there is an update in satiety from the backend
    let now = Date.now();
    if (dateDiff(now, this.lastAutoFeed) < 500) {
        return;
    }

    if (payload.vitalSign !== 'satiety') {
        return;
    }

    let satiety = payload.newValue.relative;
    // Definitely eat something if the satiety is completely gone
    if (satiety === 0) {
        this.eat(now);
        return;
    }

    // Don't eat if the satiety is above the critical threshold
    if (satiety >= GraphicsConfig.vitalSigns.overlayThreshold) {
        return;
    }

    // Wait with eating until the food can have the maximum effect
    if (satiety + this.getFoodFactor() > 1.0) {
        return;
    }

    this.eat(now);
}

export function eat(now) {
    if (Game.player.controls.onInventoryAction(
        this.activeInventorySlot.item,
        BerryhunterApi.ActionType.ConsumeItem)) {
        playCssAnimation(this.activeInventorySlot.domElement, 'eating');
        this.lastAutoFeed = now;
    }
}

export function getFoodFactor() {
    return this.activeInventorySlot.item.factors.food;
}

Events.on('autoFeed.activate', activate);
Events.on('autoFeed.deactivate', deactivate);
Events.on('vitalSign.change', checkChangedVitalSign);

export function isItemSuitable(item) {
    if (!_.isObject(item.factors)) {
        return false;
    }

    // Food = 0 is stuff that can't be eaten
    // Food <= 0.05 is stuff you can eat, but would not on a regular basis
    return item.factors.food > 0.05;
}
