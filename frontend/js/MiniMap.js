"use strict";

define(['PIXI', 'Game', 'UserInterface'], function (PIXI, Game, UserInterface) {
	class MiniMap {
		constructor(mapWidth, mapHeight) {
			this.mapWidth = mapWidth;
			this.mapHeight = mapHeight;

			/**
			 * All game objects added to the minimap.
			 */
			this.registeredGameObjects = [];

			/**
			 * Moveable game objects those minimap position will be updated continuously.
			 */
			this.trackedGameObjects = [];

			let container = UserInterface.getMinimapContainer();

			this.width = container.clientWidth;
			this.height = container.clientHeight;

			this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
			container.appendChild(container);
			this.stage = new PIXI.Container();

			this.iconGroup = new PIXI.Container();
			this.stage.addChild(this.iconGroup);
			this.iconGroup.position.set(
				this.width / 2,
				this.height / 2
			);

			this.playerGroup = new PIXI.Container();
			this.stage.addChild(this.playerGroup);
			this.playerGroup.position.set(
				this.width / 2,
				this.height / 2
			);

			const sizeFactorRelatedToMapSize = 2;
			this.scale = this.width / this.mapWidth;
			this.iconSizeFactor = this.scale * sizeFactorRelatedToMapSize;

			this.renderer.on('prerender', update.bind(this));
		}

		start() {
			this.play();
		}

		stop() {
			this.pause();
		}

		loop() {
			if (this.paused) {
				return;
			}

			requestAnimationFrame(this.loop.bind(this));

			this.renderer.render(this.stage);
		};

		play() {
			this.playing = true;
			this.paused = false;
			this.loop();
		};

		pause() {
			this.playing = false;
			this.paused = true;
		};

		/**
		 * Adds the icon of the object to the map.
		 * @param gameObject
		 */
		add(gameObject) {
			// Position each icon relative to its position on the real map.
			const minimapIcon = gameObject.createMinimapIcon();
			if (gameObject.constructor.name === 'Character') {
				this.playerGroup.add(minimapIcon);
			} else {
				this.iconGroup.add(minimapIcon);
			}

			let x = gameObject.getX() * this.scale;
			let y = gameObject.getY() * this.scale;
			minimapIcon.translation.set(x, y);
			minimapIcon.scale = this.iconSizeFactor;

			if (gameObject.isMoveable) {
				gameObject.minimapIcon = minimapIcon;
				this.trackedGameObjects.push(gameObject);
			}
			return minimapIcon;
		}

		clear() {
			this.trackedGameObjects.length = 0;
			this.playerGroup.remove(_.toArray(this.playerGroup.children));
			this.iconGroup.remove(_.toArray(this.iconGroup.children));
		}

	}

	function update() {
		this.trackedGameObjects.forEach(gameObject => {
			gameObject.minimapIcon.translation.x = gameObject.getX() * this.scale;
			gameObject.minimapIcon.translation.y = gameObject.getY() * this.scale;
		});
	}

	return MiniMap;
});