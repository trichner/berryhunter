"use strict";

const AABBs = {
	setup: function () {
		/**
		 *
		 * @param {{LowerX: number, LowerY: number, UpperX: number, UpperY: number}} aabb
		 */
		GameObject.prototype.updateAABB = function (aabb) {
			if (!(Constants.DEBUGGING.SHOW_AABBS && //
				aabb && //
				!_.isUndefined(aabb.LowerX) && //
				!_.isUndefined(aabb.LowerY) && //
				!_.isUndefined(aabb.UpperX) && //
				!_.isUndefined(aabb.UpperY))) {
				return;
			}

			let startX = aabb.LowerX;
			let startY = aabb.LowerY;
			let endX = aabb.UpperX;
			let endY = aabb.UpperY;

			if (_.isUndefined(this.aabb)) {

				let width = (endX - startX) / 2;
				let height = (endY - startY) / 2;
				// this.aabb = new Two.Rectangle(50, 50, 100, 100);
				let x = startX + width;
				let y = startY + height;
				this.aabb = new Two.Rectangle(x, y, width, height);
				groups.gameObjects.add(this.aabb);

				this.aabb.noFill();
				this.aabb.stroke = 'red';
				this.aabb.linewidth = 2;

				this.aabbConnector = new Two.Line(this.getX(), this.getY(), x, y);
				groups.gameObjects.add(this.aabbConnector);
				this.aabbConnector.stroke = 'red';
				this.aabbConnector.linewidth = 2;
			} else {
				this.aabb.translation.set((startX + endX) / 2, (startY + endY) / 2);
			}

			// let width = (endX - startX) / 2;
			// let height = (endY - startY) / 2;
			// this.aabb.translation.set(startX, startY);
			// this._matrix
			//
			//
			// this.scale()
			// this.aabb.noFill();
			// this.aabb.stroke = 'red';
			// this.aabb.linewidth = 2;
		};

		GameObject.prototype.removeAABB = function () {
			if (!_.isUndefined(this.aabb)) {
				this.aabb.noStroke();
			}
		}
	}
};