"use strict";

var GameMapGenerator = {
	generateFromQuadrants: function (width, height) {
		let objects = [];

		const gridSpacing = 100;
		Quadrants.forEach(function (quadrant, index) {
			let offsetX = index * 8 * gridSpacing;
			//TODO "Zeilenumrbrüche" wenn mehr Quadranten als Kartenbreite
			// TODO Quadranten möglichst quadratisch auslegen, statt alle in die Breite
			let offsetY = 0;

			quadrant.forEach(function (field) {
				let rx = offsetX + field.x * gridSpacing - gridSpacing / 2;
				let ry = offsetY + field.y * gridSpacing - gridSpacing / 2;

				let gameObjectClass = field.object;
				switch (gameObjectClass) {
					case Tree:
						gameObjectClass = executeRandomFunction([{
							weight: 5,
							func: () => {
								return Tree;
							}
						}, {
							weight: 1,
							func: () => {
								return MarioTree;
							}
						}]);
						break;
					case Animal:
						gameObjectClass = Rabbit;
						break;
				}
				objects.push(new gameObjectClass(rx, ry));
			}, this);
		}, this);

		return objects;
	},

	treeTable: [{
		weight: 5,
		func: () => {
			return new Tree(rx, ry);
		}
	}, {
		weight: 1,
		func: () => {
			return new MarioTree(rx, ry);
		}
	}],

	/**
	 * Most simple generator for now
	 */
	generate: function (width, height) {
		// return this.generateFromQuadrants(width, height);

		let objects = [];

		for (let x = 0; x <= width; x += 500) {
			for (let y = 0; y <= height; y += 500) {
				let rx = x + randomInt(-150, 150);
				let ry = y + randomInt(-150, 150);

				// for (let x = 0; x <= width; x += 100) {
				// 	for (let y = 0; y <= height; y += 100) {
				// let rx = x;
				// let ry = y;

				let gameObject = executeRandomFunction([{
					weight: 40,
					func: () => {
						return executeRandomFunction([{
							weight: 5,
							func: () => {
								return new Tree(rx, ry);
							}
						}, {
							weight: 1,
							func: () => {
								return new MarioTree(rx, ry);
							}
						}]);
					}
				}, {
					weight: 5,
					func: () => {
						return new Stone(rx, ry);
					}
				}, {
					weight: 5,
					func: () => {
						return new BerryBush(rx, ry);
					}
				}, {
					weight: 1,
					func: () => {
						return new Gold(rx, ry);
					}
				}, {
					weight: 10,
					func: () => {
						return executeRandomFunction([{
							weight: 3,
							func: () => {
								return new Rabbit(rx, ry);
							}
						}, {
							weight: 1,
							func: () => {
								return new SabreToothTiger(rx, ry);
							}
						}
							// }, {
							// 	weight: 1,
							// 	func: () => {
							// 		return new Mammoth(rx, ry);
							// 	}
							// }
						]);
					}
				}]);
				objects.push(gameObject);
			}
		}

		return objects;
	}
};