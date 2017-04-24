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
	constructor(x, y) {
		super(x, y);
		this.movementSpeed = Constants.BASE_MOVEMENT_SPEED;

		this.show();

		two.bind('update', this.update.bind(this));
	}

	createShape(x, y) {
		let shape = new Two.Ellipse(x, y, 30);
		shape.fill = 'rgb(128, 98, 64)';
		shape.stroke = 'rgb(255, 196, 128)';
		shape.linewidth = 2;

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

	update() {
		if (anyKeyIsPressed(UP_KEYS)) {
			this.shape.translation.y -= this.movementSpeed;
		}
		if (anyKeyIsPressed(DOWN_KEYS)) {
			this.shape.translation.y += this.movementSpeed;
		}
		if (anyKeyIsPressed(LEFT_KEYS)) {
			this.shape.translation.x -= this.movementSpeed;
		}
		if (anyKeyIsPressed(RIGHT_KEYS)) {
			this.shape.translation.x += this.movementSpeed;
		}
		// TODO bei diagonaler Bewegung darf der Movementspeed nicht überschritten werden
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

	groups.background = two.makeGroup();
	groups.character = two.makeGroup();
	groups.mapBorders = two.makeGroup();
	groups.gameObjects = two.makeGroup();
	groups.overlay = two.makeGroup();

	createBackground();

	player = new Character(width / 2, height / 2);
	gameMap = new GameMap();
	miniMap = new MiniMap(gameMap);
	playerCam = new Camera(player);

	if (typeof Fps === 'object' && Constants.SHOW_FPS) {
		Fps.setup();
	}

	var domElement = two.renderer.domElement;
	KeyEvents.init(domElement);


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


var UP_KEYS = [
	'w'.charCodeAt(0),
	'W'.charCodeAt(0),
	38 // Up Arrow
];

var DOWN_KEYS = [
	's'.charCodeAt(0),
	'S'.charCodeAt(0),
	40 // Down Arrow
];

var LEFT_KEYS = [
	'a'.charCodeAt(0),
	'A'.charCodeAt(0),
	37 // Left Arrow
];

var RIGHT_KEYS = [
	'd'.charCodeAt(0),
	'D'.charCodeAt(0),
	39 // Right Arrow
];

function anyKeyIsPressed(keyList) {
	return keyList.some(function (keyCode) {
		return KeyEvents.keyIsDown(keyCode);
	});
}