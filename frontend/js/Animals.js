"use strict";

class Animal extends GameObject {
	constructor(x, y) {
		super(x, y)
	}
}

class Rabbit extends Animal {
	constructor(x, y) {
		super(x, y)
	}

	createShape(x, y) {
		let group = new Two.Group();
		group.translation.set(x, y);
		this.diameter = 20;

		let ear = new Two.Ellipse(
			Math.cos(-Math.PI / 6 * 2) * this.diameter * 1.5,
			Math.sin(-Math.PI / 6 * 2) * this.diameter * 1.5,
			this.diameter * 0.3,
			this.diameter * 0.7
		);
		group.add(ear);
		ear.fill = 'hotpink';
		ear.stroke = 'darkmagenta';
		ear.rotation = Math.PI / 6;

		ear = new Two.Ellipse(
			Math.cos(-Math.PI / 6 * 4) * this.diameter * 1.5,
			Math.sin(-Math.PI / 6 * 4) * this.diameter * 1.5,
			this.diameter * 0.3,
			this.diameter * 0.7
		);
		group.add(ear);
		ear.fill = 'hotpink';
		ear.stroke = 'darkmagenta';
		ear.rotation = -Math.PI / 6;

		let body = new Two.Ellipse(0, 0, this.diameter);
		group.add(body);
		body.fill = 'hotpink';
		body.stroke = 'darkmagenta';
		body.linewidth = 2;

		let eye = new Two.Ellipse(
			Math.cos(-Math.PI / 6 * 2) * this.diameter * 0.5,
			Math.sin(-Math.PI / 6 * 2) * this.diameter * 0.5,
			this.diameter * 0.1);
		group.add(eye);
		eye.fill = 'black';
		eye.noStroke();

		eye = new Two.Ellipse(
			Math.cos(-Math.PI / 6 * 4) * this.diameter * 0.5,
			Math.sin(-Math.PI / 6 * 4) * this.diameter * 0.5,
			this.diameter * 0.1);
		group.add(eye);
		eye.fill = 'black';
		eye.noStroke();

		let mouth = new Two.Text('3', this.diameter * -0.1, this.diameter * 0.3);
		group.add(mouth);
		mouth.stroke = 'black';
		mouth.noFill();
		mouth.linewidth = this.diameter * 0.05;
		mouth.rotation = Math.PI / 2;

		return group;
	}

	visibleOnMinimap() {
		return false;
	}
}

class SabreToothTiger extends Animal {

	constructor(x, y) {
		super(x, y);

		let callback = function () {
			console.log("Append custom SVG");
			this.shape._renderer.elem.appendChild(SabreToothTiger.svg.cloneNode(true));
			two.unbind('render', callback);
		}.bind(this);
		two.bind('render', callback);
	}

	createShape(x, y){
		let group = new Two.Group();
		group.translation.set(x, y);
		return group;
	}

	visibleOnMinimap() {
		return false;
	}
}