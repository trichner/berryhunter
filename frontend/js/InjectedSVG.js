/**
 * Created by XieLong on 21.05.2017.
 */

class InjectedSVG extends Two.Group {
	constructor(svg, x, y, size, rotation){
		super();
		this.translation.set(x, y);
		// group.translation.set(x-size, y-size);
		let injectionGroup = new Two.Group();
		this.add(injectionGroup);
		injectionGroup.scale = (size / (Constants.GRID_SPACING / 2));
		// TODO apply rotation
		// injectionGroup.rotation = rotation;
		injectionGroup.translation.set(-size, -size);


		let callback = function () {
			injectionGroup._renderer.elem.appendChild(svg.cloneNode(true));
			two.unbind('render', callback);
		}.bind(this);
		two.bind('render', callback);
	}
}