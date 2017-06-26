"use strict";

/**
 * This class has advanced knowledge about SVG structures
 * and is able to manipulate loaded sprites.
 */
define(['Utils'], function (Utils) {
	const SvgLoader = {

		/**
		 *
		 * @param {Element} mainSvgElement
		 */
		setup: function (mainSvgElement) {
			mainSvgElement.getElementsByTagName('defs')[0].appendChild(this.defContainer);
		},

		load: function (svgMarkup) {
			let svgElement = Utils.htmlToElement(svgMarkup);

			let newIds = {};

			// Collect all defs in the loaded svg ...
			let defs = svgElement.getElementsByTagName('defs');
			for (let i = 0; i < defs.length; i++) {
				let def = defs[i];
				while (def.children.length) {
					let child = def.children[0];
					if (child.id) {
						// Rewrite def ids with a unique namespace
						let newId = String.fromCharCode(this.defIndex) + '_' + child.id;
						newIds[child.id] = '#' + newId;
						child.id = newId;
					} else {
						console.warn('Def has no id?', child);
					}

					// ... and append them to the global def container
					this.defContainer.appendChild(child);
				}

				// Defs is not needed anymore, remove it
				def.remove();
			}
			this.defIndex++;

			// Rewrite def id usages within the SVG
			let elementsWithStyle = svgElement.querySelectorAll('[style]');
			for (let i = 0; i < elementsWithStyle.length; ++i) {
				let element = elementsWithStyle[i];
				let style = element.style.cssText;
				// Skip styles that don't even contain an id reference
				if (!style.includes('#')) {
					continue;
				}
				for (let id in newIds) {
					style = Utils.replaceAll(style, '#' + id, newIds[id]);
				}
				element.style.cssText = style;
			}

			return svgElement;
		}
	};

	/**
	 * Keeps track of a unique namespace for each loaded SVG.
	 * @type {Number}
	 */
	SvgLoader.defIndex = "a".charCodeAt(0);
	SvgLoader.defContainer = document.createDocumentFragment();

	return SvgLoader;
});