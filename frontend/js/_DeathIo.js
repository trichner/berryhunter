"use strict";
/**
 * @type Two
 */
var two;

/**
 * Ordered by z-index
 */
var groups = {};

var width;
var height;

/**
 * @type Physics
 */
var physics;

/**
 * @type Character
 */
var player;
/**
 * @type GameMap
 */
var gameMap;

/**
 * @type MiniMap
 */
var miniMap;

/**
 * @type Camera
 */
var playerCam;

class Character extends GameObject {
	constructor(id, x, y) {
		super(x, y);
		this.id = id;

		this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;

		this.show();

		this.controls = new Controls(this);

		two.bind('update', this.controls.update.bind(this.controls));

		this.isMoving = false;
	}

	createShape(x, y) {
		let shape = new Two.Ellipse(x, y, 30);
		shape.fill = 'rgb(128, 98, 64)';
		shape.stroke = 'rgb(255, 196, 128)';
		shape.linewidth = 2;

		// this.body = physics.registerDynamic(x, y, 30);
		// this.body.twoShape = shape;

		return shape;
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

		this.shape.translation.addSelf(moveVec.setLength(this.movementSpeed));
	}

	action() {
		console.info("Action by Player " + this.id);
	}

	altAction() {
		console.info("Alt Action by Player " + this.id);
	}
}

preload();

function htmlToElement(html) {
	var template = document.createElement('template');
	template.innerHTML = html;
	return template.content.firstChild;
}

function preload() {
	Two.Utils.xhr('img/sabreToothTiger2.svg', function (responseText) {
		SabreToothTiger.svg = htmlToElement(responseText);
		setup();
	});
}

function createBackground() {
	var background = new Two.Rectangle(width / 2, height / 2, width, height);
	groups.background.add(background);
	background.fill = 'rgb(0, 96, 48)';
	background.noStroke();
}

function setup() {
	// Setup backend first, as this will take some time to connect.
	Backend.setup();

	if (QuadrantRenderer.isActive()) {
		two = QuadrantRenderer.setup();
	} else {
		QuadrantRenderer.disable();
		two = new Two({
			fullscreen: true,
			type: Two.Types.svg
		}).appendTo(document.body);
	}

	width = two.width;
	height = two.height;

	// physics = new Physics(width, height);

	groups.background = two.makeGroup();
	groups.character = two.makeGroup();
	groups.mapBorders = two.makeGroup();
	groups.gameObjects = two.makeGroup();
	groups.overlay = two.makeGroup();

	createBackground();

	player = new Character(1, width / 2, height / 2);
	gameMap = new GameMap();
	miniMap = new MiniMap(gameMap);
	playerCam = new Camera(player);

	if (typeof Fps === 'object' && Constants.SHOW_FPS) {
		Fps.setup();
	}

	var domElement = two.renderer.domElement;
	KeyEvents.init(domElement);

	// domElement.addEventListener('pointerup', function (event) {
	// 	console.log("pointerup", event);
	// });
	// domElement.addEventListener('pointerdown', function (event) {
	// 	console.log("pointerdown", event);
	// });


	domElement.addEventListener('blur', function () {
		two.pause();
	});
	domElement.addEventListener('focus', function () {
		two.play();
	});


	/*
	 * Set up animation loop.
	 */
	two.play();


	if (QuadrantRenderer.isActive()) {
		QuadrantRenderer.afterSetup();
	}

	// two.unbind('update');

	// two.update();

	document.body.classList.remove('loading');
}