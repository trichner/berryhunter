'use strict';

import {isDefined, nearlyEqual} from '../Utils';
import {BackendState} from "../interfaces/IBackend";
import _clone = require('lodash/clone');


let lastGameState;

export class Snapshot {
    tick: number;
    player: any; // TODO introduce interfaces to player, spectator, entity...
    entities: [];
    inventory: []
}

export function newSnapshot(backendState: BackendState, gameState) {
    let snapshot;
    if (this.hasSnapshot()) {
        snapshot = {};
        snapshot.tick = gameState.tick;

        snapshot.player = _clone(gameState.player);

        if (backendState === BackendState.PLAYING &&
            !lastGameState.player.isSpectator &&
            nearlyEqual(lastGameState.player.position.x, gameState.player.position.x, 0.01) &&
            nearlyEqual(lastGameState.player.position.y, gameState.player.position.y, 0.01)) {
            delete snapshot.player.position;
        }

        // Inventory handles item stacks
        snapshot.inventory = gameState.inventory;

        // GameMapWithBackend handles entity states
        snapshot.entities = gameState.entities;
    } else {
        snapshot = gameState;
    }

    lastGameState = gameState;

    return snapshot;
}

export function hasSnapshot() {
    return isDefined(lastGameState);
}

export function getLastGameState() {
    return lastGameState;
}
