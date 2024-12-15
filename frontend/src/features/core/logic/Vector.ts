export interface IVector {
    x: number;
    y: number;
}

export class Vector {
    x: number;
    y: number;

    static zero = new Vector();

    constructor(x: number = 0, y: number = 0) {
        this.x = x || 0;
        this.y = y || 0;
    }

    static clone(vector: IVector): Vector {
        return new Vector(vector.x, vector.y);
    }

    set(x: number, y: number): Vector {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v: IVector): Vector {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    clear(): Vector {
        this.x = 0;
        this.y = 0;
        return this;
    }

    clone(): Vector {
        return new Vector(this.x, this.y);
    }

    add(v: IVector): Vector {
        this.x += v.x;
        this.y += v.y;
        return this;
    }


    sub(v: IVector): Vector {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(v: IVector): Vector {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    multiplyScalar(s: number): Vector {
        this.x *= s;
        this.y *= s;
        return this;
    }

    divideScalar(s: number): Vector {
        if (s) {
            this.x /= s;
            this.y /= s;
        } else {
            this.set(0, 0);
        }
        return this;
    }

    negate(): Vector {
        return this.multiplyScalar(-1);
    }

    dot(v: IVector): number {
        return this.x * v.x + this.y * v.y;
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    normalize(): Vector {
        return this.divideScalar(this.length());
    }

    distanceTo(v: IVector): number {
        return Math.sqrt(this.distanceToSquared(v));
    }

    distanceToSquared(v: IVector): number {
        let dx = this.x - v.x,
            dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    limit(max: number): Vector {
        const mSq = this.lengthSquared();
        if (mSq > max * max) {
            this.divideScalar(Math.sqrt(mSq)); //normalize it
            this.multiplyScalar(max);
        }
        return this;
    }

    setLength(l: number): Vector {
        return this.normalize().multiplyScalar(l);
    }

    equals(v: IVector, eps: number = 0.0001): boolean {
        return (this.distanceTo(v) < eps);
    }

    lerp(v: IVector, t: number): Vector {
        let x = (v.x - this.x) * t + this.x;
        let y = (v.y - this.y) * t + this.y;
        return this.set(x, y);
    }

    isZero(eps: number = 0.0001): boolean {
        return (this.length() < eps);
    }

    toString(): string {
        return this.x + ',' + this.y;
    }

    toObject(): IVector {
        return {x: this.x, y: this.y};
    }
}
