class Character extends GameObject {
	constructor(id, x, y) {
		super(x, y, 30, Math.PI / 2);
		this.id = id;

		this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;
		this.isMoveable = true;

		this.show();

		this.currentAction = false;

		this.createHands(this.size);
	}

	createHands(size){
		this.shape.rotation = Math.PI / -2;

		// TODO Hände unter die Frisur rendern
		const handAngle = 0;
		const handAngleDistance = 0.4;

		this.leftHand = new Two.Ellipse(
			Math.cos(handAngle - Math.PI * handAngleDistance) * size * 0.8,
			Math.sin(handAngle - Math.PI * handAngleDistance) * size * 0.8,
			size * 0.2
		);
		this.shape.add(this.leftHand);
		this.leftHand.fill = '#f2a586';
		this.leftHand.stroke = '#000';
		this.leftHand.linewidth = 0.212 * 0.6; // relative to size
		this.leftHand.originalTranslation = this.leftHand.translation.clone();

		this.rightHand = new Two.Ellipse(
			Math.cos(handAngle + Math.PI * handAngleDistance) * size * 0.8,
			Math.sin(handAngle + Math.PI * handAngleDistance) * size * 0.8,
			size * 0.2
		);
		this.shape.add(this.rightHand);
		this.rightHand.fill = '#f2a586';
		this.rightHand.stroke = '#000';
		this.rightHand.linewidth = 0.212 * 0.6; // relative to size
		this.rightHand.originalTranslation = this.rightHand.translation.clone();
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

		const smiley = executeRandomFunction([
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

	move(movement) {
		// TODO Offline mode
		if (!MapEditor.isActive()) {
			return;
		}
		let moveVec = new Two.Vector().copy(movement);

		moveVec.setLength(this.movementSpeed);


		let lastX = this.getX();
		let lastY = this.getY();

		this.shape.translation.addSelf(moveVec.setLength(this.movementSpeed));

		if (this.rotateOnPositioning) {
			this.shape.rotation = TwoDimensional.angleBetween(lastX, lastY, this.getX(), this.getY());
		}
	}

	action() {
		this.currentAction = 'MAIN';
	}

	altAction() {
		this.currentAction = 'ALT';
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
			if (this.actionAnimationFrame > 0.7 * Character.hitAnimationFrameDuration) {
				offset = sq(( Character.hitAnimationFrameDuration + 1 - this.actionAnimationFrame)) /
					sq(0.3 * Character.hitAnimationFrameDuration) * maxOffset;
			} else if (this.actionAnimationFrame > 0.6 * Character.hitAnimationFrameDuration) {
				offset = maxOffset;
			} else {
				offset = this.actionAnimationFrame / (0.6 * Character.hitAnimationFrameDuration) * maxOffset;
			}
			hand.translation.x = hand.originalTranslation.x + offset;

			if (this.actionAnimationFrame <= 1) {
				this.currentAction = false;
			}
		}
	}
}

Character.hitAnimationFrameDuration = 15;

registerGameObjectSVG(Character, 'img/character.svg');