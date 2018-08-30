'use strict';

define([], function () {
	//noinspection UnnecessaryLocalVariableJS
	const AABBs = {
		setup: function () {
			require([
				'Game',
				'GameObject',
				'Develop',
				'Utils',
				'PIXI'
			], function (Game, GameObject, Develop, Utils, PIXI) {

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

						let width = (endX - startX);
						let height = (endY - startY);
						let x = startX + width / 2;
						let y = startY + height / 2;

						this.aabb = new PIXI.Graphics();
						this.layer.addChild(this.aabb);
						this.aabb.lineColor = Develop.settings.elementColor;
						this.aabb.lineWidth = Develop.settings.linewidth;
						this.aabb.drawRect(x, y, width, height);

						this.aabbConnector = new PIXI.Graphics();
						this.layer.addChild(this.aabbConnector);
						this.aabbConnector.lineColor = Develop.settings.elementColor;
						this.aabbConnector.lineWidth = Develop.settings.linewidth;
						this.aabbConnector.moveTo(this.getX(), this.getY());
						this.aabbConnector.lineTo(x, y);
					} else {
						this.aabb.position.set((startX + endX) / 2, (startY + endY) / 2);
					}
				};

				GameObject.prototype.hideAABB = function () {
					if (Utils.isDefined(this.aabb)) {
						this.aabb.noStroke();
					}
				};

				GameObject.prototype.showAABB = function () {
					if (Utils.isDefined(this.aabb)) {
						this.aabb.stroke = Develop.settings.elementColor;
						this.aabb.linewidth = Develop.settings.linewidth;
					}
				};

				let super_hide = GameObject.prototype.hide;
				GameObject.prototype.hide = function () {
					super_hide.call(this);

					if (Utils.isDefined(this.aabb)) {
						this.aabb.parent.removeChild(this.aabb);
						delete this.aabb;
					}
				};
			});
		}
	};

	return AABBs;
});