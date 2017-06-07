"use strict";

class Character extends GameObject {
	constructor(id, x, y) {
		super(x, y, 30, Math.PI / 2);
		this.id = id;

		this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;
		this.isMoveable = true;

		this.show();

		this.currentAction = false;

		// Rotate the character according the 0-angle in drawing space
		this.shape.rotation = Math.PI / -2;

		/**
		 * Needs the same properties as EquipmentSlot
		 */
		this.equipmentSlotGroups = {};
		this.equippedItems = {};
		for (let equipmentSlot in EquipmentSlot) {
			//noinspection JSUnfilteredForInLoop
			this.equippedItems[equipmentSlot] = null;
		}

		let placeableSlot = new Two.Group();
		this.shape.add(placeableSlot);
		this.equipmentSlotGroups[EquipmentSlot.PLACEABLE] = placeableSlot;
		placeableSlot.translation.set(
			Constants.PLACEMENT_RANGE,
			0
		);
		placeableSlot.opacity = 0.6;

		this.createHands();

		Object.values(this.equipmentSlotGroups).forEach(function (equipmentSlot) {
			equipmentSlot.originalTranslation = equipmentSlot.translation.clone();
		})
	}

	createHands() {
		// TODO Hände unter die Frisur rendern
		const handAngleDistance = 0.4;

		this.leftHand = this.createHand(-handAngleDistance).group;
		this.shape.add(this.leftHand);


		let rightHand = this.createHand(handAngleDistance);
		this.rightHand = rightHand.group;
		this.shape.add(this.rightHand);

		this.equipmentSlotGroups[EquipmentSlot.HAND] = rightHand.slot;
	}

	createHand(handAngleDistance) {
		let group = new Two.Group();

		const handAngle = 0;
		group.translation.set(
			Math.cos(handAngle + Math.PI * handAngleDistance) * this.size * 0.8,
			Math.sin(handAngle + Math.PI * handAngleDistance) * this.size * 0.8,
		);

		let slotGroup = new Two.Group();
		group.add(slotGroup);
		slotGroup.translation.set(-this.size * 0.2, 0);
		slotGroup.rotation = Math.PI / 2;

		let handShape = new Two.Ellipse(0, 0, this.size * 0.2);
		group.add(handShape);
		handShape.fill = '#f2a586';
		handShape.stroke = '#000';
		handShape.linewidth = 0.212 * 0.6; // relative to size

		group.originalTranslation = group.translation.clone();

		return {
			group: group,
			slot: slotGroup
		};
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

		this.movePosition(moveVec);
	}

	action() {
		if (this.isSlotEquipped(this.equipmentSlotGroups.PLACEABLE)) {
			this.currentAction = 'PLACING';
			return Character.hitAnimationFrameDuration;
		}

		this.currentAction = 'MAIN';
		return Character.hitAnimationFrameDuration;
	}

	altAction() {
		if (this.isSlotEquipped(this.equipmentSlotGroups.PLACEABLE)) {
			this.currentAction = false;
			return 0;
		}

		this.currentAction = 'ALT';
		return Character.hitAnimationFrameDuration;
	}

	progressHitAnimation(animationFrame) {
		this.actionAnimationFrame = animationFrame;
	}

	update() {
		if (this.currentAction) {
			let hand;
			switch (this.currentAction) {
				case 'MAIN':
				case 'PLACING':
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

	isSlotEquipped(equipementSlot) {
		if (typeof equipementSlot === 'string') {
			equipementSlot = this.equipmentSlotGroups[equipementSlot];
		}
		return equipementSlot.children.length > 0;
	}

	equipItem(item, equipementSlot) {
		let slotGroup = this.equipmentSlotGroups[equipementSlot];
		if (this.isSlotEquipped(slotGroup)) {
			this.unequipItem();
		}
		// Offsets are applied to the slot itself to respect the slot rotation
		if (isDefined(item.graphic.offsetX)) {
			slotGroup.translation.x = slotGroup.originalTranslation.x + item.graphic.offsetX * 2;
		} else {
			slotGroup.translation.x = slotGroup.originalTranslation.x;
		}
		if (isDefined(item.graphic.offsetY)) {
			slotGroup.translation.y = slotGroup.originalTranslation.y + item.graphic.offsetY * 2;
		} else {
			slotGroup.translation.y = slotGroup.originalTranslation.y;
		}
		slotGroup.add(new InjectedSVG(item.graphic.svg, 0, 0, item.graphic.size || Constants.GRID_SPACING));

		this.equippedItems[equipementSlot] = item;
	}

	unequipItem(equipementSlot) {
		let slotGroup = this.equipmentSlotGroups[equipementSlot];
		if (!this.isSlotEquipped(equipementSlot)) {
			return;
		}
		slotGroup.children[0].remove();
		this.equippedItems[equipementSlot] = null;
	}

	getEquippedItem(equipementSlot) {
		return this.equippedItems[equipementSlot];
	}
}

Character.hitAnimationFrameDuration = 15;

registerGameObjectSVG(Character, 'img/character.svg');