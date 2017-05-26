"use strict";

let gameStarted = false;

/**
 * @type Two
 */
let two;

/**
 * Ordered by z-index
 */
const groups = {};

let width, height;

let centerX, centerY;

/**
 * @type Player
 */
let player;
/**
 * @type GameMap
 */
let gameMap;

/**
 * @type MiniMap
 */
let miniMap;

preload();

function preload() {
	executePreload()
		.then(() => {
			setup();
		});
}

function createBackground() {
	const background = new Two.Rectangle(width / 2, height / 2, width, height);
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
		two = new Two({
			fullscreen: true,
			type: Two.Types.svg
		}).appendTo(document.body);
	}

	width = two.width;
	height = two.height;

	centerX = width / 2;
	centerY = height / 2;

	groups.background = two.makeGroup();
	groups.character = two.makeGroup();
	groups.mapBorders = two.makeGroup();
	groups.gameObjects = two.makeGroup();
	groups.overlay = two.makeGroup();

	createBackground();

	// TODO if offline createPlayer
	// player = new Character(1, width / 2, height / 2);
	// playerCam = new Camera(player);
	gameMap = new GameMapWithBackend();
	miniMap = new MiniMap(gameMap);

	if (Develop.isActive() &&
		typeof Fps === 'object' &&
		Constants.DEBUGGING.SHOW_FPS) {
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


	if (MapEditor.isActive()) {
		MapEditor.afterSetup();
	}

	document.body.classList.remove('loading');
}

/**
 * Creating a player starts implicitly the game
 */
function createPlayer(id, x, y) {
	player = new Player(id, x, y);
	two.play();
}