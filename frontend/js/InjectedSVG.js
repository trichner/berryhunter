class InjectedSVG extends Two.Group {
	constructor(svg, x, y, size, rotation) {
		super();

		if (isUndefined(svg) || typeof svg.cloneNode !== 'function') {
			throw svg + ' is not a valid SVG node';
		}

		this.translation.set(x, y);
		// group.translation.set(x-size, y-size);
		let injectionGroup = new Two.Group();
		this.add(injectionGroup);
		injectionGroup.scale = (size / (Constants.GRID_SPACING / 2));
		// TODO apply rotation
		// injectionGroup.rotation = rotation;
		injectionGroup.translation.set(-size, -size);

		two.once('render', function () {
			injectionGroup._renderer.elem.appendChild(svg.cloneNode(true));
		});
	}
}