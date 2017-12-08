"use strict";


define(['underscore'], function (_) {

	let Vector = function (x, y) {

		this.x = x || 0;
		this.y = y || 0;

	};

	_.extend(Vector, {

		zero: new Vector()

	});

	let methods = {

		set: function (x, y) {
			this.x = x;
			this.y = y;
			return this;
		},

		copy: function (v) {
			this.x = v.x;
			this.y = v.y;
			return this;
		},

		clear: function () {
			this.x = 0;
			this.y = 0;
			return this;
		},

		clone: function () {
			return new Vector(this.x, this.y);
		},

		add: function (v) {
			this.x += v.x;
			this.y += v.y;
			return this;
		},


		sub: function (v) {
			this.x -= v.x;
			this.y -= v.y;
			return this;
		},

		multiply: function (v) {
			this.x *= v.x;
			this.y *= v.y;
			return this;
		},

		multiplyScalar: function (s) {
			this.x *= s;
			this.y *= s;
			return this;
		},

		divideScalar: function (s) {
			if (s) {
				this.x /= s;
				this.y /= s;
			} else {
				this.set(0, 0);
			}
			return this;
		},

		negate: function () {
			return this.multiplyScalar(-1);
		},

		dot: function (v) {
			return this.x * v.x + this.y * v.y;
		},

		lengthSquared: function () {
			return this.x * this.x + this.y * this.y;
		},

		length: function () {
			return Math.sqrt(this.lengthSquared());
		},

		normalize: function () {
			return this.divideScalar(this.length());
		},

		distanceTo: function (v) {
			return Math.sqrt(this.distanceToSquared(v));
		},

		distanceToSquared: function (v) {
			var dx = this.x - v.x,
				dy = this.y - v.y;
			return dx * dx + dy * dy;
		},

		limit: function (max) {
			const mSq = this.lengthSquared();
			if (mSq > max * max) {
				this.divideScalar(Math.sqrt(mSq)); //normalize it
				this.multiplyScalar(max);
			}
			return this;
		},

		setLength: function (l) {
			return this.normalize().multiplyScalar(l);
		},

		equals: function (v, eps) {
			eps = (typeof eps === 'undefined') ? 0.0001 : eps;
			return (this.distanceTo(v) < eps);
		},

		lerp: function (v, t) {
			var x = (v.x - this.x) * t + this.x;
			var y = (v.y - this.y) * t + this.y;
			return this.set(x, y);
		},

		isZero: function (eps) {
			eps = (typeof eps === 'undefined') ? 0.0001 : eps;
			return (this.length() < eps);
		},

		toString: function () {
			return this.x + ',' + this.y;
		},

		toObject: function () {
			return {x: this.x, y: this.y};
		}

	};
	_.extend(Vector.prototype, methods);

	/*
	 * Create static versions of all Vector methods
	 */

	Object.keys(methods).forEach(function (methodName) {
		if (methods.hasOwnProperty(methodName)) {
			let staticMethod = function (v) {
				const args = Array.prototype.splice.call(arguments, 1);
				let vector = new Vector(v.x, v.y);
				return vector[methodName].apply(vector, args)
			};
			// Function name remapping
			switch (methodName) {
				case 'length':
					// Function.length is a readonly property (which represents the number of parameters)
					Vector['lengthOf'] = staticMethod;
					break;
				default:
					Vector[methodName] = staticMethod
			}
		}
	});

	return Vector;
});