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
 * @type GameMap|GameMapWithBackend
 */
let gameMap;

/**
 * @type MiniMap
 */
let miniMap;

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
		typeof Fps === 'object') {
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

	if (Constants.MOVEMENT_INTERPOLATION) {
		two.bind('update', moveInterpolatedObjects);
	}

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

requirejs.config({
	paths: {
		schema_common: [
			'schema/common_generated',
			'../../api/schema/js/common_generated'],
		schema_server: [
			'schema/server_generated',
			'../../api/schema/js/server_generated'],
		schema_client: [
			'schema/client_generated',
			'../../api/schema/js/client_generated']
	}
});

_import(
	'schema_common',
	'schema_server',
	'schema_client'
);

preload();

function preload() {
	executePreload()
		.then(() => {
			setup();
		});
}