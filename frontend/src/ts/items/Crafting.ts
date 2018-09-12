'use strict';

import * as Game from '../Game';
import * as MapEditor from '../mapEditor/_MapEditor';
import {arraysEqual, isUndefined} from '../Utils';
import {Items} from '../items/Items';
import * as UserInterface from '../userInterface/UserInterface';
import {BerryhunterApi} from '../backend/BerryhunterApi';


//noinspection UnnecessaryLocalVariableJS
export let displayedCrafts = [];

export function displayAvailableCrafts(availableCrafts) {
    if (arraysEqual(this.displayedCrafts, availableCrafts, function (a, b) {
        return a.id === b.id && a.isCraftable === b.isCraftable;
    })) {
        // Nothing to do here
        return;
    }

    // Add to the list of available (=rendered) crafts the currently displayed crafts that are in progress
    // https://trello.com/c/oT8FLSHZ
    availableCrafts = availableCrafts.concat(this.displayedCrafts.filter(function (recipe) {
        if (isUndefined(recipe.clickableIcon)) {
            return false;
        }

        if (!recipe.clickableIcon.inProgress) {
            return false;
        }

        // Only add the craft if it is not already part of available crafts
        return availableCrafts.indexOf(recipe) === -1;
    }));

    this.displayedCrafts = availableCrafts.map(function (recipe) {
        return {
            id: recipe.item.id,
            isCraftable: recipe.isCraftable
        }
    });

    UserInterface.displayAvailableCrafts(availableCrafts, onCraftIconLeftClick);
}

function onCraftIconLeftClick(event, recipe) {
    if (!recipe.isCraftable) {
        return;
    }

    if (MapEditor.isActive()) {
        for (let material in recipe.materials) {
            //noinspection JSUnfilteredForInLoop
            Game.player.inventory.removeItem(
                Items[material],
                recipe.materials[material],
            );
        }
        Game.player.inventory.addItem(recipe.item);
    } else {
        if (Game.player.isCraftInProgress()) {
            return;
        }

        if (!Game.player.inventory.canFitCraft(recipe.item, recipe.materials)) {
            UserInterface.flashInventory();
            return;
        }

        let actionAllowed = Game.player.controls
            .onInventoryAction(
                recipe.item,
                BerryhunterApi.ActionType.CraftItem);
        if (actionAllowed) {
            this.startProgress(recipe.craftingTime);
            Game.player.startCraftProgress(recipe.craftingTime);
        }
    }
}
