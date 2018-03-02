'use strict';

define(['./ClickableIcon'], function (ClickableIcon) {
	class ClickableCountableIcon extends ClickableIcon {

		/**
		 * @param {Element} node
		 */
		constructor(node) {
			super(node);

			this.countNode = this.domElement.querySelector('.count');
		}

		setCount(count) {
			if (count <= 1) {
				this.countNode.classList.add('hidden');
			} else {
				this.countNode.classList.remove('hidden');
				this.countNode.textContent = count;
			}
		}
	}

	return ClickableCountableIcon;
});