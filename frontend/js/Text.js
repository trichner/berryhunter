define(['underscore'], function (_) {
	const Text = {};

	Text.defaultStyle = function () {
		return {
			fontFamily: 'stone-age',
			fontSize: 24,
			// fontWeight: '700',
			align: 'center',
			fontVariant: 'small-caps'
		};
	};

	Text.style = function (additionalStyle) {
		return _.extend(this.defaultStyle(), additionalStyle);
	};

	return Text;
});