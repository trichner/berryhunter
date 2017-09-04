"use strict";

/**
 * This class has advanced knowledge about SVG structures
 * and is able to manipulate loaded sprites.
 */
define(['Utils'], function (Utils) {

	let defContainer = document.createDocumentFragment();
	let seenSvgs = {};

	const SvgLoader = {

		/**
		 *
		 * @param {Element} mainSvgElement
		 */
		setup: function (mainSvgElement) {
			mainSvgElement.getElementsByTagName('defs')[0].appendChild(defContainer);
		},

		load: function (svgPath, svgMarkup) {
			if (seenSvgs.hasOwnProperty(svgPath)){
				return seenSvgs[svgPath];
			}

			let match = /([a-zA-Z]+)\.svg/.exec(svgPath);
			if (match === null) {
				throw 'svgPath "' + svgPath + '" does not match the expected pattern!';
			}

			let svgName = match[1];
			let svgElement = Utils.svgToElement(svgMarkup);
			let newIds = {};

			// Collect all defs in the loaded svg ...
			let defs = svgElement.getElementsByTagName('defs');
			for (let i = 0; i < defs.length; i++) {
				let def = defs[i];
				while (def.children.length) {
					let child = def.children[0];
					if (child.id) {
						// Rewrite def ids with a unique namespace
						let newId = svgName + '_' + child.id;
						newIds[child.id] = '#' + newId;
						child.id = newId;
					} else {
						console.warn('Def has no id?', child);
					}

					// ... and append them to the global def container
					defContainer.appendChild(child);
				}

				// Defs is not needed anymore, remove it
				def.remove();
			}

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

			seenSvgs[svgPath] = svgElement;

			return svgElement;
		}
	};


	return SvgLoader;
});