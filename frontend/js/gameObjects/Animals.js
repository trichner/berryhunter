"use strict";

require(['gameObjects/_GameObject'], function () {
	class Animal extends GameObject {
		constructor(x, y, size, rotation) {
			super(x, y, size, rotation);
			this.rotateOnPositioning = true;
			this.isMoveable = true;
		}

		visibleOnMinimap() {
			return false;
		}
	}
	window.Animal = Animal;

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
	}

	window.Rabbit = Rabbit;

	class SaberToothCat extends Animal {

		constructor(x, y) {
			super(x, y, randomInt(30, 50));
		}
	}

	window.SaberToothCat = SaberToothCat;
	registerGameObjectSVG(SaberToothCat, 'img/saberToothCat.svg');

	class Mammoth extends Animal {

		constructor(x, y) {
			super(x, y, randomInt(60, 90));
		}
	}

	window.Mammoth = Mammoth;
	registerGameObjectSVG(Mammoth, 'img/mammoth.svg');

});