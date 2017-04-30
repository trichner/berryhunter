"use strict";

class Physics {
	constructor(width, height) {
		this.width = Measurement.forPixel(width);
		this.height = Measurement.forPixel(height);

		this.world = planck.World();

		two.bind('update', this.update.bind(this));
	}

	update() {
		this.world.step(two.timeDelta);

		for (var body = this.world.getBodyList(); body; body = body.getNext()) {
			if (body.twoShape) {
				body.twoShape.translation.set(
					Measurement.forMetres(body.getPosition().x).getPixel(),
					Measurement.forMetres(body.getPosition().y).getPixel());
			}
			// for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
			// 	// draw or update fixture
			//
			// }
		}
	}

	registerStatic(x, y, radius) {
		let xMeasurement = Measurement.forPixel(x);
		let yMeasurement = Measurement.forPixel(y);
		let radiusMeasurement = Measurement.forPixel(radius);

		let body = this.world.createBody({
			position: planck.Vec2(xMeasurement.getMetres(), yMeasurement.getMetres()),
		});
		body.xMeasurement = xMeasurement;
		body.yMeasurement = yMeasurement;

		let fixture = body.createFixture(planck.Circle(radiusMeasurement.getMetres()));
		fixture.radiusMeasurement = radiusMeasurement;

		return body;
	}

	registerDynamic(x, y, radius) {
		let xMeasurement = Measurement.forPixel(x);
		let yMeasurement = Measurement.forPixel(y);
		let radiusMeasurement = Measurement.forPixel(radius);

		let body = this.world.createBody({
			type: 'dynamic',
			angularDamping: 2.0,
			linearDamping: 0.9,
			position: planck.Vec2(xMeasurement.getMetres(), yMeasurement.getMetres()),
		});
		body.xMeasurement = xMeasurement;
		body.yMeasurement = yMeasurement;

		let fixture = body.createFixture(planck.Circle(radiusMeasurement.getMetres()), {
			density: 1
			// filterCategoryBits : SHIP,
			// filterMaskBits : ASTEROID
		});
		fixture.radiusMeasurement = radiusMeasurement;

		return body;
	}
}