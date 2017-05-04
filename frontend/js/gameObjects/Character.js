class Character extends GameObject {
	constructor(id, x, y) {
		super(x, y);
		this.id = id;

		this.isMoveable = true;
		this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;

		this.show();

		this.controls = new Controls(this);

		// this.isMoving = false;
	}

	createShape(x, y) {
		let group = new Two.Group();
		group.translation.set(x, y);
		group.rotation = Math.PI / 2;

		let shape = new Two.Ellipse(0, 0, 30);
		group.add(shape);
		shape.fill = 'rgb(128, 98, 64)';
		shape.stroke = 'rgb(255, 196, 128)';
		shape.linewidth = 2;

		var smiley = executeRandomFunction([
			{
				weight: 4,
				func: function () {
					return ': )';
				}
			},
			{
				weight: 1,
				func: function () {
					return ': (';
				}
			},
			{
				weight: 2,
				func: function () {
					return ': o';
				}
			},
			{
				weight: 2,
				func: function () {
					return ': b';
				}
			},
			{
				weight: 1,
				func: function () {
					return ': (';
				}
			},
			{
				weight: 1,
				func: function () {
					return ': /';
				}
			}]);

		group.add(new Two.Text(smiley, 0, 0, {
			size: 60 * 0.6,
			fill: 'rgb(255, 196, 128)'
		}));

		// this.body = physics.registerDynamic(x, y, 30);
		// this.body.twoShape = shape;

		return group;
	}

	createMinimapIcon(x, y, size) {
		let shape = new Two.Ellipse(x, y, 30 * 7 * size, 30 * 7 * size);
		shape.fill = 'darkblue';
		shape.noStroke();

		return shape;
	}

	show() {
		groups.character.add(this.shape);
	}

	hide() {
		groups.character.remove(this.shape);
	}

	stopMovement() {
		// if (this.isMoving){
		// 	// this.body.setLinearVelocity(new planck.Vec2());
		// 	this.isMoving = false;
		// }
	}

	move(movement) {
		// TODO Offline mode
		if (!MapEditor.isActive()) {
			return;
		}
		let moveVec = new Two.Vector().copy(movement);
		// if (moveVec.lengthSquared() === 0) {
		// 	// No movement happened, cancel
		// 	return;
		// }

		moveVec.setLength(this.movementSpeed);


		// // this.body.setLinearVelocity(
		// // 	// this.body.getLinearVelocity().add(Measurement.vec2meters(moveVec))
		// // 	Measurement.vec2meters(moveVec)
		// // );
		//
		// this.body.setPosition(
		// 	this.body.getPosition().add(Measurement.vec2meters(moveVec))
		// );
		//
		// this.isMoving = true;

		let lastX = this.getX();
		let lastY = this.getY();

		this.shape.translation.addSelf(moveVec.setLength(this.movementSpeed));

		if (this.isMoveable) {
			this.shape.rotation = TwoDimensional.angleBetween(lastX, lastY, this.getX(), this.getY());
		}
	}

	action() {
		console.info("Action by Player " + this.id);
	}

	altAction() {
		console.info("Alt Action by Player " + this.id);
	}
}