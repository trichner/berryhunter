'use strict';

export class Vector {
    x: number;
    y: number;

    static zero = new Vector();

    constructor(x?, y?) {

        this.x = x || 0;
        this.y = y || 0;

    }

    static clone(vector) {
        return new Vector(vector.x, vector.y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    clear() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }


    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    divideScalar(s) {
        if (s) {
            this.x /= s;
            this.y /= s;
        } else {
            this.set(0, 0);
        }
        return this;
    }

    negate() {
        return this.multiplyScalar(-1);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    normalize() {
        return this.divideScalar(this.length());
    }

    distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v));
    }

    distanceToSquared(v) {
        let dx = this.x - v.x,
            dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    limit(max) {
        const mSq = this.lengthSquared();
        if (mSq > max * max) {
            this.divideScalar(Math.sqrt(mSq)); //normalize it
            this.multiplyScalar(max);
        }
        return this;
    }

    setLength(l) {
        return this.normalize().multiplyScalar(l);
    }

    equals(v, eps) {
        eps = (typeof eps === 'undefined') ? 0.0001 : eps;
        return (this.distanceTo(v) < eps);
    }

    lerp(v, t) {
        let x = (v.x - this.x) * t + this.x;
        let y = (v.y - this.y) * t + this.y;
        return this.set(x, y);
    }

    isZero(eps) {
        eps = (typeof eps === 'undefined') ? 0.0001 : eps;
        return (this.length() < eps);
    }

    toString() {
        return this.x + ',' + this.y;
    }

    toObject() {
        return {x: this.x, y: this.y};
    }
}

