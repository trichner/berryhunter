"use strict";

define(['Game', 'GameObject', 'Utils', 'InjectedSVG', 'items/Items'], function (Game, GameObject, Utils, InjectedSVG, Items) {
	class Placeable extends GameObject {
		constructor(placeableItem, x, y) {
			super(getGameLayer(placeableItem), x, y, placeableItem.graphic.size, Utils.random(0, Math.PI * 2), placeableItem.graphic.svg);

			this.visibleOnMinimap = false;

			this.item = placeableItem;
			this.layer = getGameLayer(placeableItem);
		}

		createShape(x, y, size, rotation, svg) {
			return new InjectedSVG(svg, x, y, size, rotation);
		}

		is(placeableItem) {
			if (typeof placeableItem === 'string') {
				return this.item.name = placeableItem;
			}
			return this.item === placeableItem;
		}
	}

	function getGameLayer(item) {
		switch (item) {
			case Items.Seeds:
				return Game.layers.resources.berryBush;
			case Items.BigCampfire:
			case Items.Campfire:
				return Game.layers.placeables.campfire;
			case Items.Workbench:
				return Game.layers.placeables.workbench;
			case Items.BigChest:
			case Items.Chest:
				return Game.layers.placeables.chest;
			case Items.Furnace:
				return Game.layers.placeables.furnace;
			case Items.WoodDoor:
			case Items.StoneDoor:
			case Items.BronceDoor:
			case Items.IronDoor:
				return Game.layers.placeables.doors;
			case Items.WoodWall:
			case Items.StoneWall:
			case Items.BronzeWall:
			case Items.IronWall:
			case Items.WoodSpikyWall:
			case Items.StoneSpikyWall:
			case Items.BronzeSpikyWall:
			case Items.IronSpikyWall:
				return Game.layers.placeables.walls;
		}
	}

	return Placeable;
});