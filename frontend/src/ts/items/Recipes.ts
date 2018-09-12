'use strict';

import * as Game from '../Game';
import {isDefined, isFunction} from '../Utils';
import {BasicConfig as Constants} from '../../config/Basic';
import Placeable from '../gameObjects/Placeable';
import Items from '../items/Items';

/**
 * Gets filled with all defined recipes
 */
let definedRecipes = [];

/*
 * Combinators
 */

const Combinators = {
    /**
     * Any of the provided placeables have to be nearby.
     *
     * @returns {{operator: string, parameters: Array}}
     */
    any: function (items) {
        return {
            operator: 'or',
            parameters: items,
        }
    },

    /**
     * All of the provided placeables have to be nearby.
     *
     * @returns {{operator: string, parameters: Array}}
     */
    every: function (items) {
        return {
            operator: 'and',
            parameters: items,
        }
    },
};


/**
 * Read all recipes from the items that have been loaded with definitions.
 */
export function setup() {
    for (let itemName in Items) {
        let item = Items[itemName];

        item.isCrafted = isDefined(item.recipe);

        /* Only list recipes for items that
         *	a) have a recipe and
         *	b) have an icon
         */
        if (item.isCrafted && item.icon.file) {
            let recipe = {
                name: itemName,
                item: item,
                craftingTime: item.recipe.craftTimeInSeconds,
                materials: {},
                nearby: undefined,
                requiredYield: undefined
            };

            if (isDefined(item.recipe.tools)) {
                if (item.recipe.tools.length === 1) {
                    recipe.nearby = Items[item.recipe.tools[0]];
                } else {
                    recipe.nearby = Combinators.any(item.recipe.tools.map((itemName) => {
                        return Items[itemName];
                    }))
                }
            }

            /*
             * Loop through all required materials and
             * 1. transform them into a map
             * 2. determine the required yield (= the highest minimum yield of all materials)
             */
            let requiredYield = 0;
            item.recipe.materials.forEach((material) => {
                recipe.materials[material.item] = material.count;
                if (isDefined(Items[material.item].factors) &&
                    Items[material.item].factors.minimumYield > requiredYield) {
                    requiredYield = Items[material.item].factors.minimumYield;
                }
            });

            // Required yield is 1 more than minimum yield, because with 1 yield
            // a resource with minimumYield 1 is not yieldable
            recipe.requiredYield = requiredYield + 1;
            item.recipe = recipe;

            definedRecipes.push(recipe);
        }
    }
}

/**
 *
 * @param {Inventory} inventory
 * @return Array.<*> of recipes where enough materials are available
 */
export function getCraftableRecipes(inventory) {
    let availableItems = {};
    let maximumYield = Items.None['factors'].yield;
    // FIXME IMPROVEMENT: associative inventory could be cached
    inventory.slots.forEach(function (slot) {
        if (slot.isFilled()) {
            availableItems[slot.item.name] = slot.count;
            if (isDefined(slot.item.factors) &&
                slot.item.factors.yield > maximumYield) {
                maximumYield = slot.item.factors.yield;
            }
        }
    });

    return definedRecipes.filter(function (recipe) {
        // Everything is craftable by default. Missing or
        // insufficient resources will flag the recipe as not craftable.
        recipe.isCraftable = true;
        for (let material in recipe.materials) {
            // Is material missing?
            if (!availableItems.hasOwnProperty(material)) {
                // If crafted materials are missing, do not show this recipe
                if (Items[material].isCrafted) {
                    return false;
                } else if (recipe.requiredYield > maximumYield) {
                    // If the required yield to get the materials of this recipe
                    // is higher than the actual yield of all items in
                    // the inventory, do not show this craft, as the player is
                    // not able yet to even acquire the resources.
                    return false;
                } else {
                    // Missing non-crafted, but attainable materials: show as hinted craft
                    recipe.isCraftable = false;
                }
                // Is material amount insufficient?
            } else if (availableItems[material] < recipe.materials[material]) {
                // Insufficient materials: show as hinted craft
                recipe.isCraftable = false;
            }
        }

        return true;
    });
}

export function checkNearbys(recipes) {
    if (recipes.length === 0) {
        return recipes;
    }

    let recipesWithNear = [];
    let recipesWithoutNear = [];

    /*
     * Step 1: Sort recipes by having a 'nearby' requirement or not
     */
    recipes.forEach(function (recipe) {
        if (isDefined(recipe.nearby)) {
            recipesWithNear.push(recipe);
        } else {
            recipesWithoutNear.push(recipe);
        }
    });

    /*
     * No recipes with nearby requirements - nothing to do here
     */
    if (recipesWithNear.length === 0) {
        return recipesWithoutNear;
    }

    /*
     * Get placeables in view as a first rough check
     */
    let getObjectsInRange;
    if (isFunction(Game.map.getObjectsInRange)) {
        getObjectsInRange = Game.map.getObjectsInRange.bind(Game.map, Game.player.character.getPosition(), Constants.CRAFTING_RANGE);
    } else {
        getObjectsInRange = Game.map.getObjectsInView
    }

    let placeablesInView = getObjectsInRange.call(Game.map).filter(function (gameObject) {
        return gameObject.constructor === Placeable;
    });

    /*
     * No placeables in sight, nothing to check
     */
    if (placeablesInView.length === 0) {
        return recipesWithoutNear;
    }

    /**
     * Cache of specific placeables (like Campfire or Workbench) that are within crafting range - or not
     *
     * @type {{Placeable: boolean}}
     */
    let placeablesNearby = {};

    function isNearby(placeableItem) {
        if (placeablesNearby.hasOwnProperty(placeableItem.name)) {
            return placeablesNearby[placeableItem.name];
        } else {
            let nearby = placeablesInView.some(function (placeable) {
                if (placeable.is(placeableItem)) {
                    let distance = placeable.getPosition().distanceToSquared(Game.player.character.getPosition());
                    return distance <= Math.pow(Constants.CRAFTING_RANGE, 2);
                }
                return false;
            });
            placeablesNearby[placeableItem.name] = nearby;
            return nearby;
        }
    }

    recipesWithNear = recipesWithNear.filter(function (recipe) {
        if (isDefined(recipe.nearby.operator)) {
            // Its a combinator
            switch (recipe.nearby.operator) {
                case 'or':
                    return recipe.nearby.parameters.some(function (placeableItem) {
                        return isNearby(placeableItem);
                    });
                case 'and':
                    return recipe.nearby.parameters.every(function (placeableItem) {
                        return isNearby(placeableItem);
                    });
                default:
                    throw 'Unknown operator "' + recipe.nearby.operator + "'";
            }
        } else {
            // Should be a placeable item
            return isNearby(recipe.nearby);
        }
    });

    return recipesWithNear.concat(recipesWithoutNear);
}
