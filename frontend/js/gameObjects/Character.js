class Character extends GameObject {
	constructor(id, x, y) {
		super(x, y, 30, Math.PI / 2);
		this.id = id;

		this.isMoveable = true;
		this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;

		this.show();

		this.controls = new Controls(this);

		this.currentAction = false;

		// this.isMoving = false;
	}


	createInjectionGroup(x, y, size, rotation) {
		let group = super.createInjectionGroup(x, y, size, rotation);

		// TODO Hände unter die Frisur rendern
		let handAngle = 1.7;

		this.leftHand = new Two.Ellipse(
			Math.cos(Math.PI * handAngle) * size * 0.8,
			Math.sin(Math.PI * handAngle) * size * 0.8,
			size * 0.2
		);
		group.add(this.leftHand);
		this.leftHand.fill = '#f2a586';
		this.leftHand.stroke = '#000';
		this.leftHand.linewidth = 0.212 * 0.6; // relative to size
		this.leftHand.originalTranslation = this.leftHand.translation.clone();

		this.rightHand = new Two.Ellipse(
			Math.cos(Math.PI * (2 - handAngle)) * size * 0.8,
			Math.sin(Math.PI * (2 - handAngle)) * size * 0.8,
			size * 0.2
		);
		group.add(this.rightHand);
		this.rightHand.fill = '#f2a586';
		this.rightHand.stroke = '#000';
		this.rightHand.linewidth = 0.212 * 0.6; // relative to size
		this.rightHand.originalTranslation = this.rightHand.translation.clone();

		return group;
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
		this.currentAction = 'MAIN';
		// console.info("Action by Player " + this.id);
	}

	altAction() {
		this.currentAction = 'ALT';
		// console.info("Alt Action by Player " + this.id);
	}

	progressHitAnimation(animationFrame) {
		this.actionAnimationFrame = animationFrame;
	}

	update() {
		if (this.currentAction) {
			let hand;
			switch (this.currentAction) {
				case 'MAIN':
					hand = this.rightHand;
					break;
				case 'ALT':
					hand = this.leftHand;
					break;
			}

			const maxOffset = this.size * 0.4;
			let offset;
			if (this.actionAnimationFrame > 21) {
				offset = sq((31 - this.actionAnimationFrame)) / (9 * 9) * maxOffset;
			} else if (this.actionAnimationFrame > 18) {
				offset = maxOffset;
			} else {
				offset = this.actionAnimationFrame / 18 * maxOffset;
			}
			hand.translation.x = hand.originalTranslation.x + offset;

			if (this.actionAnimationFrame <= 1) {
				this.currentAction = false;
			}
		}
	}
}

registerGameObjectSVG(Character, 'img/character.svg');