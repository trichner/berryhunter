"use strict";

var gameStarted = false;

/**
 * @type Two
 */
var two;

/**
 * Ordered by z-index
 */
var groups = {};

var width, height;

var centerX, centerY;

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

preload();

function preload() {
	executePreload()
		.then(() => {
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

	if (MapEditor.isActive()) {
		two = MapEditor.setup();
	} else {
		// Setup backend first, as this will take some time to connect.
		Backend.setup();

		MapEditor.disable();
		two = new Two({
			fullscreen: true,
			type: Two.Types.svg
		}).appendTo(document.body);
	}

	width = two.width;
	height = two.height;

	centerX = width / 2;
	centerY = height / 2;

	// physics = new Physics(width, height);

	groups.background = two.makeGroup();
	groups.character = two.makeGroup();
	groups.mapBorders = two.makeGroup();
	groups.gameObjects = two.makeGroup();
	groups.overlay = two.makeGroup();

	createBackground();

	// TODO if offline createPlayer
	// player = new Character(1, width / 2, height / 2);
	gameMap = new GameMapWithBackend();
	miniMap = new MiniMap(gameMap);
	// playerCam = new Camera(player);

	if (typeof Fps === 'object' && Constants.SHOW_FPS) {
		Fps.setup();
	}

	let domElement = two.renderer.domElement;
	SvgLoader.setup(domElement);
	KeyEvents.setup(domElement);
	PointerEvents.setup(domElement);

	// Disable context menu on right click to use the right click ingame
	document.body.addEventListener('contextmenu', function (event) {
		if (event.target === domElement || domElement.contains(event.target)) {
			event.preventDefault();
		}
	});
	domElement.addEventListener('blur', function () {
		two.pause();
	});
	domElement.addEventListener('focus', function () {
		if (gameStarted) {
			two.play();
		}
	});


	/*
	 * Set up animation loop.
	 */
	// two.play();


	if (MapEditor.isActive()) {
		MapEditor.afterSetup();
	}

	// two.unbind('update');

	// two.update();

	document.body.classList.remove('loading');
}

/**
 * Creating a player starts implicitly the game
 */
function createPlayer(id, x, y) {
	gameStarted = true;

	player = new Character(id, x, y);

	two.bind('update', player.update.bind(player));

	playerCam = new Camera(player);
	miniMap.register(player);
	two.play();
}