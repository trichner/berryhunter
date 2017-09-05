"use strict";

define([
	'Game',
	'GameObject',
	'Two',
	'Constants',
	'Utils',
	'MapEditor',
	'items/Equipment',
	'InjectedSVG',
	'Preloading',
], function (Game, GameObject, Two, Constants, Utils, MapEditor, Equipment, InjectedSVG, Preloading) {
	class Character extends GameObject {
		constructor(id, x, y, name) {
			super(Game.layers.characters, x, y, 30, Math.PI / 2);
			this.id = id;
			this.name = name;

			this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;
			this.isMoveable = true;
			this.visibleOnMinimap = false;

			this.currentAction = false;

			/**
			 * Needs the same properties as Equipment.Slots
			 */
			this.equipmentSlotGroups = {};
			this.equippedItems = {};
			for (let equipmentSlot in Equipment.Slots) {
				//noinspection JSUnfilteredForInLoop
				this.equippedItems[equipmentSlot] = null;
			}

			let placeableSlot = new Two.Group();
			this.actualShape.add(placeableSlot);
			this.equipmentSlotGroups[Equipment.Slots.PLACEABLE] = placeableSlot;
			placeableSlot.translation.set(
				Constants.PLACEMENT_RANGE,
				0,
			);
			placeableSlot.opacity = 0.6;

			this.createHands();

			Object.values(this.equipmentSlotGroups).forEach(function (equipmentSlot) {
				equipmentSlot.originalTranslation = equipmentSlot.translation.clone();
			});

			// Rotate the character according the 0-angle in drawing space
			this.setRotation(Math.PI / -2);

			this.createName();

			this.messages = [];
			this.messagesGroup = new Two.Group();
			this.shape.add(this.messagesGroup);
			this.messagesGroup.translation.y = -1.3 * (this.size + 16);

			Game.two.bind('update', this.update.bind(this));
		}

		initShape(x, y, size, rotation) {
			let group = new Two.Group();
			group.translation.set(x, y);

			this.actualShape = super.initShape(0, 0, size, rotation);
			group.add(this.actualShape);

			return group;
		}

		setRotation(rotation) {
			if (Utils.isUndefined(rotation)) {
				return;
			}

			this.actualShape.rotation = rotation;
		}

		getRotation() {
			return this.actualShape.rotation;
		}

		createHands() {
			// TODO Hände unter die Frisur rendern
			const handAngleDistance = 0.4;

			this.leftHand = this.createHand(-handAngleDistance).group;
			this.actualShape.add(this.leftHand);


			let rightHand = this.createHand(handAngleDistance);
			this.rightHand = rightHand.group;
			this.actualShape.add(this.rightHand);

			this.equipmentSlotGroups[Equipment.Slots.HAND] = rightHand.slot;
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
				slot: slotGroup,
			};
		}

		createName() {
			if (!this.name) {
				return;
			}

			if (Utils.isDefined(this.nameElement)) {
				this.nameElement.value = name;
				return;
			}

			let text = new Two.Text(this.name, 0, -1.3 * this.size, {
				// family: '"stone-age", serif',
				// size: 18,
				alignment: 'center',
				fill: 'white',
				weight: '700',
			});
			this.shape.add(text);
			this.nameElement = text;
		}

		createMinimapIcon() {
			let shape = new Two.Ellipse(0, 0, 30 * 3);
			shape.fill = 'darkblue';
			shape.noStroke();

			return shape;
		}

		move(movement) {
			if (!MapEditor.isActive()) {
				return;
			}
			let moveVec = new Two.Vector().copy(movement);

			moveVec.setLength(this.movementSpeed);

			this.movePosition(moveVec);
		}

		action() {
			if (this.isSlotEquipped(Equipment.Slots.PLACEABLE)) {
				this.currentAction = 'PLACING';
				return Character.hitAnimationFrameDuration;
			}

			this.currentAction = 'MAIN';
			return Character.hitAnimationFrameDuration;
		}

		altAction() {
			if (this.isSlotEquipped(Equipment.Slots.PLACEABLE)) {
				this.currentAction = false;
				return 0;
			}

			this.currentAction = 'ALT';
			return Character.hitAnimationFrameDuration;
		}

		progressHitAnimation(animationFrame) {
			this.actionAnimationFrame = animationFrame;
		}

		update(frameCount, timeDelta) {
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
					offset = Utils.sq(( Character.hitAnimationFrameDuration + 1 - this.actionAnimationFrame)) /
						Utils.sq(0.3 * Character.hitAnimationFrameDuration) * maxOffset;
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

			this.messages = this.messages.filter((message) => {
				message.timeToLife -= timeDelta;
				if (message.timeToLife <= 0) {
					// message.visible = false;
					this.messagesGroup.remove(message);
					return false;
				}
				return true;
			})
		}

		isSlotEquipped(equipmentSlot) {
			return this.equippedItems[equipmentSlot] !== null;
		}

		/**
		 *
		 * @param item
		 * @param equipmentSlot
		 * @return {Boolean} whether or not the item was equipped
		 */
		equipItem(item, equipmentSlot) {
			// If the same item is already equipped, just cancel
			if (this.equippedItems[equipmentSlot] === item) {
				return false;
			}

			let slotGroup = this.equipmentSlotGroups[equipmentSlot];
			// Offsets are applied to the slot itself to respect the slot rotation
			if (Utils.isDefined(item.graphic.offsetX)) {
				slotGroup.translation.x = slotGroup.originalTranslation.x + item.graphic.offsetX * 2;
			} else {
				slotGroup.translation.x = slotGroup.originalTranslation.x;
			}
			if (Utils.isDefined(item.graphic.offsetY)) {
				slotGroup.translation.y = slotGroup.originalTranslation.y + item.graphic.offsetY * 2;
			} else {
				slotGroup.translation.y = slotGroup.originalTranslation.y;
			}
			slotGroup.add(new InjectedSVG(item.graphic.svg, 0, 0, item.graphic.size || Constants.GRID_SPACING));

			this.equippedItems[equipmentSlot] = item;

			return true;
		}

		/**
		 *
		 * @param equipmentSlot
		 * @return {Item} the item that was unequipped
		 */
		unequipItem(equipmentSlot) {
			// If the slot is already empty, just cancel
			if (this.equippedItems[equipmentSlot] === null) {
				return;
			}

			let slotGroup = this.equipmentSlotGroups[equipmentSlot];
			if (!this.isSlotEquipped(equipmentSlot)) {
				return;
			}
			slotGroup.children[0].remove();

			let item = this.equippedItems[equipmentSlot];
			this.equippedItems[equipmentSlot] = null;

			return item;
		}

		getEquippedItem(equipmentSlot) {
			return this.equippedItems[equipmentSlot];
		}

		say(message) {
			let fontSize = 16;

			// Move all currently displayed messages up
			this.messages.forEach((message) => {
				message.translation.y -= fontSize * 1.2;
			});

			let messageShape = new Two.Text(message, 0, 0, {
				size: fontSize,
				alignment: 'center',
				fill: '#e37313',
			});
			messageShape.timeToLife = Constants.CHAT_MESSAGE_DURATION;
			this.messagesGroup.add(messageShape);

			this.messages.push(messageShape);
		}
	}

	Character.hitAnimationFrameDuration = 15;
	Preloading.registerGameObjectSVG(Character, 'img/character.svg');

	return Character;
});