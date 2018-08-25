'use strict';

define(['underscore'], function (_) {
	const Text = {};

	Text.defaultStyle = function () {
		return {
			fontFamily: 'stone-age',
			fontSize: 26,
			align: 'center',
			fontVariant: 'small-caps',
			letterSpacing: 2
		};
	};

	Text.style = function (additionalStyle) {
		return _.extend(this.defaultStyle(), additionalStyle);
	};

	return Text;
});