"use strict";

class Physics {
	constructor(width, height){
		this.width = Measurement.forPixel(width);
		this.height = Measurement.forPixel(height);

		this.world = planck.World();
	}

	update() {
		this.world.step(two.timeDelta);

		for (var body = this.world.getBodyList(); body; body = body.getNext()) {
			for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
				// draw or update fixture
			}
		}
	}

	registerStatic // TODO

	registerDynamic(x, y, radius) {
		let xMeasurement = Measurement.forPixel(x);
		let yMeasurement = Measurement.forPixel(y);
		let radiusMeasurement = Measurement.forPixel(radius);

		let body = world.createBody({
			type : 'dynamic',
			angularDamping : 2.0,
			linearDamping : 0.5,
			position : Vec2(xMeasurement.getMetres(), yMeasurement.getMetres()),
		});
		body.xMeasurement = xMeasurement;
		body.yMeasurement = yMeasurement;

		let fixture = body.createFixture(pl.Circle(radiusMeasurement.getMetres()), {
			density : 1
			// filterCategoryBits : SHIP,
			// filterMaskBits : ASTEROID
		});
		fixture.radiusMeasurement = radiusMeasurement;
	}
}