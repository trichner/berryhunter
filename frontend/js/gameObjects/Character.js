"use strict";

define([
	'Game',
	'GameObject',
	'PIXI',
	'NamedGroup',
	'Constants',
	'Utils',
	'MapEditor',
	'items/Equipment',
	'InjectedSVG',
	'Preloading',
	'Vector'
], function (Game, GameObject, PIXI, NamedGroup, Constants, Utils, MapEditor, Equipment, InjectedSVG, Preloading, Vector) {
	class Character extends GameObject {
		constructor(id, x, y, name, isPlayerCharacter) {
			super(Game.layers.characters, x, y, Constants.CHARACTER_SIZE, Math.PI / 2);
			this.id = id;
			this.name = name;
			this.isPlayerCharacter = isPlayerCharacter;

			this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;
			this.isMoveable = true;
			this.visibleOnMinimap = false;
			this.turnRate = 0;

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

			let placeableSlot = new PIXI.Container();
			this.actualShape.addChild(placeableSlot);
			this.equipmentSlotGroups[Equipment.Slots.PLACEABLE] = placeableSlot;
			placeableSlot.position.set(
				Constants.PLACEMENT_RANGE,
				0,
			);
			placeableSlot.opacity = 0.6;

			this.createHands();

			Object.values(this.equipmentSlotGroups).forEach(function (equipmentSlot) {
				equipmentSlot.originalTranslation = Vector.clone(equipmentSlot.position);
			});

			// Rotate the character according the 0-angle in drawing space
			this.setRotation(Math.PI / -2);

			this.createName();

			// Contains PIXI.Containers that will mirror this characters position
			this.followGroups = [];

			let messagesFollowGroup = new PIXI.Container();
			Game.layers.characterAdditions.chatMessages.addChild(messagesFollowGroup);
			this.followGroups.push(messagesFollowGroup);

			this.messages = [];
			this.messagesGroup = new PIXI.Container();
			messagesFollowGroup.addChild(this.messagesGroup);
			this.messagesGroup.position.y = -1.3 * (this.size + 16);

			if (this.isPlayerCharacter) {
				let craftProgressFollowGroup = new PIXI.Container();
				Game.layers.characterAdditions.craftProgress.addChild(craftProgressFollowGroup);
				this.followGroups.push(craftProgressFollowGroup);

				let craftingIndicator = new NamedGroup('craftingIndicator');
				this.craftingIndicator = craftingIndicator;
				craftProgressFollowGroup.addChild(craftingIndicator);
				craftingIndicator.position.y = -1.3 * (this.size + 16) - 20;
				craftingIndicator.addChild(new InjectedSVG(Character.craftingIndicator.svg, 0, 0, 20));
				craftingIndicator.visible = false;

				let circle = new PIXI.Graphics();
				this.craftingIndicator.circle = circle;
				craftingIndicator.addChild(circle);
				// Let the progress start at 12 o'clock
				circle.rotation = -0.5 * Math.PI;
			}

			this.followGroups.forEach(function (group) {
				group.position.copy(this.shape.position);
			}, this);

			Game.renderer.on('prerender', this.update, this);
		}

		initShape(x, y, size, rotation) {
			let group = new PIXI.Container();
			group.position.set(x, y);

			this.actualShape = new NamedGroup('actualShape');
			this.actualShape.addChild(super.initShape(0, 0, size, rotation));
			group.addChild(this.actualShape);

			return group;
		}

		getRotationShape() {
			return this.actualShape;
		}

		createHands() {
			// TODO Hände unter die Frisur rendern
			const handAngleDistance = 0.4;

			this.leftHand = this.createHand(-handAngleDistance).group;
			this.actualShape.addChild(this.leftHand);


			let rightHand = this.createHand(handAngleDistance);
			this.rightHand = rightHand.group;
			this.actualShape.addChild(this.rightHand);

			this.equipmentSlotGroups[Equipment.Slots.HAND] = rightHand.slot;
		}

		createHand(handAngleDistance) {
			let group = new PIXI.Container();

			const handAngle = 0;
			group.position.set(
				Math.cos(handAngle + Math.PI * handAngleDistance) * this.size * 0.8,
				Math.sin(handAngle + Math.PI * handAngleDistance) * this.size * 0.8,
			);

			let slotGroup = new PIXI.Container();
			group.addChild(slotGroup);
			slotGroup.position.set(-this.size * 0.2, 0);
			slotGroup.rotation = Math.PI / 2;

			let handShape = new PIXI.Graphics();
			group.addChild(handShape);
			handShape.beginFill(0xf2a586);
			handShape.lineColor = 0x000000;
			handShape.lineWidth = 0.212 * 0.6; // relative to size
			handShape.drawCircle(0, 0, this.size * 0.2);

			group.originalTranslation = Vector.clone(group.position);

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

			let text = new PIXI.Text(this.name, {
				fontFamily: 'stone-age',
				fontSize: 18,
				fontWeight: '700',
				align: 'center',
				fill: 'white'
			});
			text.anchor.set(0.5, 0.5);
			this.shape.addChild(text);
			text.position.set(0, -1.3 * this.size);
			this.nameElement = text;
		}

		createMinimapIcon() {
			let shape = new PIXI.Graphics();
			shape.beginFill(0x00008B);
			shape.drawCircle(0, 0, 30 * 3);

			return shape;
		}

		move(movement) {
			if (!MapEditor.isActive()) {
				return;
			}
			let moveVec = new Vector().copy(movement);

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

		update() {
			let timeDelta = Game.timeDelta;
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
					offset = Utils.sq((Character.hitAnimationFrameDuration + 1 - this.actionAnimationFrame)) /
						Utils.sq(0.3 * Character.hitAnimationFrameDuration) * maxOffset;
				} else if (this.actionAnimationFrame > 0.6 * Character.hitAnimationFrameDuration) {
					offset = maxOffset;
				} else {
					offset = this.actionAnimationFrame / (0.6 * Character.hitAnimationFrameDuration) * maxOffset;
				}
				hand.position.x = hand.originalTranslation.x + offset;

				if (this.actionAnimationFrame <= 1) {
					this.currentAction = false;
				}
			}

			this.messages = this.messages.filter((message) => {
				message.timeToLife -= timeDelta;
				if (message.timeToLife <= 0) {
					this.messagesGroup.removeChild(message);
					return false;
				}
				return true;
			});

			let craftProgress = Game.player.craftProgress;
			if (craftProgress) {
				craftProgress.current += timeDelta;

				let progress = craftProgress.current / craftProgress.duration;
				if (progress >= 1) {
					Game.player.craftProgress = false;
					progress = 1;
					this.craftingIndicator.visible = false;
				}

				this.craftingIndicator.circle.clear();
				this.craftingIndicator.circle.lineStyle(5, 0xc9a741, 1);
				this.craftingIndicator.circle.arc(0, 0, 27, 0, progress * 2 * Math.PI);
			}

			this.followGroups.forEach(function (group) {
				group.position.copy(this.shape.position);
			}, this);
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
				slotGroup.position.x = slotGroup.originalTranslation.x + item.graphic.offsetX * 2;
			} else {
				slotGroup.position.x = slotGroup.originalTranslation.x;
			}
			if (Utils.isDefined(item.graphic.offsetY)) {
				slotGroup.position.y = slotGroup.originalTranslation.y + item.graphic.offsetY * 2;
			} else {
				slotGroup.position.y = slotGroup.originalTranslation.y;
			}
			let equipmentGraphic = new InjectedSVG(item.graphic.svg, 0, 0, item.graphic.size);
			slotGroup.addChild(equipmentGraphic);

			if (equipmentSlot === Equipment.Slots.PLACEABLE){
				equipmentGraphic.rotation = Math.PI / -2;
			}

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
			slotGroup.removeChildAt(0);

			let item = this.equippedItems[equipmentSlot];
			this.equippedItems[equipmentSlot] = null;

			return item;
		}

		getEquippedItem(equipmentSlot) {
			return this.equippedItems[equipmentSlot];
		}

		say(message) {
			let fontSize = 18;

			// Move all currently displayed messages up
			this.messages.forEach((message) => {
				message.position.y -= fontSize * 1.2;
			});

			let messageShape = new PIXI.Text(message, {
				fontFamily: 'stone-age',
				fontSize: fontSize,
				align: 'center',
				fill: '#e37313',
			});
			messageShape.anchor.set(0.5, 0.5);
			messageShape.timeToLife = Constants.CHAT_MESSAGE_DURATION;
			this.messagesGroup.addChild(messageShape);

			this.messages.push(messageShape);
		}
	}

	Character.hitAnimationFrameDuration = 15;
	Preloading.registerGameObjectSVG(Character, 'img/character.svg', 30);

	Character.craftingIndicator = {};
	Preloading.registerGameObjectSVG(Character.craftingIndicator, 'img/crafting.svg', 20);

	return Character;
});