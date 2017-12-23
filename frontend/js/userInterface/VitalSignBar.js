define([], function () {
	class VitalSignBar {

		/**
		 * @param {Element} node
		 */
		constructor(node) {
			this.domElement = node;
			this.indicator = node.querySelector('.indicator');
		}

		/**
		 *
		 * @param value 0.0 - 1.0
		 */
		setValue(value) {
			this.indicator.style.width = (value * 100).toFixed(2) + '%';
		}
	}

	return VitalSignBar;
});
