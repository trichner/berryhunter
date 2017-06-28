"use strict";

define([], function () {
	let Game = {};

	Game.started = false;

	require([
		'Two',
		'MapEditor',
		'Backend',
		'Develop',
		'GameMapWithBackend',
		'MiniMap',
		'SvgLoader',
		'KeyEvents',
		'PointerEvents',
		'Player',
		'GameObject'
	], function (Two, MapEditor, Backend, Develop, GameMapWithBackend, MiniMap, SvgLoader, KeyEvents, PointerEvents, Player, GameObject) {
		console.log('Game.setup');

		function createBackground() {
			const background = new Two.Rectangle(Game.width / 2, Game.height / 2, Game.width, Game.height);
			Game.groups.background.add(background);
			background.fill = 'rgb(0, 96, 48)';
			background.noStroke();
		}

		if (MapEditor.isActive()) {
			/**
			 * @type Two
			 */
			Game.two = MapEditor.setup();
		} else {
			// Setup backend first, as this will take some time to connect.
			Backend.setup();
			Game.two = new Two({
				fullscreen: true,
				type: Two.Types.svg
			});
			document.body.insertBefore(
				Game.two.renderer.domElement,
				document.body.firstChild);
		}

		Game.width = Game.two.width;
		Game.height = Game.two.height;

		Game.centerX = Game.width / 2;
		Game.centerY = Game.height / 2;

		/**
		 * Ordered by z-index
		 */
		Game.groups = {};

		Game.groups.background = Game.two.makeGroup();
		Game.groups.character = Game.two.makeGroup();
		Game.groups.mapBorders = Game.two.makeGroup();
		Game.groups.gameObjects = Game.two.makeGroup();
		Game.groups.overlay = Game.two.makeGroup();

		createBackground();

		GameObject.setup();

		// TODO if offline createPlayer
		// player = new Character(1, width / 2, height / 2);
		// playerCam = new Camera(player);

		/**
		 * @type GameMap|GameMapWithBackend
		 */
		Game.map = new GameMapWithBackend();

		/**
		 * @type MiniMap
		 */
		Game.miniMap = new MiniMap(Game.map);

		let domElement = Game.two.renderer.domElement;
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
			Game.two.pause();
		});
		domElement.addEventListener('focus', function () {
			if (Game.started) {
				Game.two.play();
			}
		});

		if (Develop.isActive()) {
			Develop.afterSetup(Game);
		}

		if (MapEditor.isActive()) {
			MapEditor.afterSetup(Game);
		}

		document.body.classList.remove('loading');

		/**
		 * Creating a player starts implicitly the game
		 */
		Game.createPlayer = function (id, x, y) {
			/**
			 * @type Player
			 */
			Game.player = new Player(id, x, y);
			Game.two.play();
		};
	});


	Game.relativeWidth = function (value) {
		return value * Game.width / 100;
	};

	Game.relativeHeight = function (value) {
		return value * Game.height / 100;
	};

	return Game;
});