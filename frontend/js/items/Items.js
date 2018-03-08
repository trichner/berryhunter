'use strict';

/**
 * Item configs are getting loaded.
 *
 */
define(['Environment', 'Utils', 'Preloading', 'items/ItemType', '../../config/Items'],
	function (Environment, Utils, Preloading, ItemType, Items) {

		(function preloadItemIcons() {

			// Disable caching
			let cacheBuster = '';
			if (Environment.cachingEnabled()) {
				cacheBuster = '?' + (new Date()).getTime();
			}

			let definitionPath;
			if (Environment.subfolderPath()) {
				definitionPath = '../api/items/';
			} else {
				definitionPath = 'js/item-definitions/'
			}

			for (let itemName in Items) {
				let item = Items[itemName];

				item.name = itemName;

				if (item.icon && item.icon.file) {
					item.icon.path = 'img/items/' + item.icon.file + '.svg' + cacheBuster;
					Preloading.registerSVG(item.icon.path);
				}
				if (item.graphic && item.graphic.file) {
					item.graphic.path = 'img/items/' + item.graphic.file + '.svg' + cacheBuster;
					item.graphic.size = item.graphic.size || Constants.GRAPHIC_BASE_SIZE;
					Preloading.registerGameObjectSVG(item.graphic, item.graphic.path, item.graphic.size);
				}
				if (item.definition) {
					Preloading.registerPreload(Utils.makeRequest({
						method: 'GET',
						url: definitionPath + item.definition + '.json' + cacheBuster
					}).then(itemDefinition => {
						itemDefinition = JSON.parse(itemDefinition);
						if (item.name !== itemDefinition.name) {
							throw 'Loaded "' + item.definition + '.json" for item "' + item.name + '" but got "' + itemDefinition.name + '".';
						}

						item.id = itemDefinition.id;
						item.type = ItemType[itemDefinition.type];
						item.recipe = itemDefinition.recipe;
						item.factors = itemDefinition.factors;
					}));
				}
			}
		})();

		return Items;
	});
