"use strict";

define(['Game', 'GameObject', 'Develop', 'Utils', 'Two'], function (Game, GameObject, Develop, Utils, Two) {

	//noinspection UnnecessaryLocalVariableJS
	const AABBs = {
		setup: function () {
			/**
			 *
			 * @param {{LowerX: number, LowerY: number, UpperX: number, UpperY: number}} aabb
			 */
			GameObject.prototype.updateAABB = function (aabb) {
				if (!(Develop.settings.showAABBs && //
					aabb && //
					!Utils.isUndefined(aabb.LowerX) && //
					!Utils.isUndefined(aabb.LowerY) && //
					!Utils.isUndefined(aabb.UpperX) && //
					!Utils.isUndefined(aabb.UpperY))) {
					return;
				}

				let startX = aabb.LowerX;
				let startY = aabb.LowerY;
				let endX = aabb.UpperX;
				let endY = aabb.UpperY;

				if (Utils.isUndefined(this.aabb)) {

					let width = (endX - startX) / 2;
					let height = (endY - startY) / 2;
					let x = startX + width;
					let y = startY + height;
					this.aabb = new Two.Rectangle(x, y, width, height);
					Game.groups.gameObjects.add(this.aabb);

					this.aabb.noFill();
					this.aabb.stroke = Develop.settings.elementColor;
					this.aabb.linewidth = Develop.settings.linewidth;

					this.aabbConnector = new Two.Line(this.getX(), this.getY(), x, y);
					Game.groups.gameObjects.add(this.aabbConnector);
					this.aabbConnector.stroke = Develop.settings.elementColor;
					this.aabbConnector.linewidth = Develop.settings.linewidth;
				} else {
					this.aabb.translation.set((startX + endX) / 2, (startY + endY) / 2);
				}
			};

			GameObject.prototype.hideAABB = function () {
				if (!Utils.isUndefined(this.aabb)) {
					this.aabb.noStroke();
				}
			};

			GameObject.prototype.showAABB = function () {
				if (!Utils.isUndefined(this.aabb)) {
					this.aabb.stroke = Develop.settings.elementColor;
					this.aabb.linewidth = Develop.settings.linewidth;
				}
			};
		}
	};

	return AABBs;
});