// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
'use strict';

// The "Vehicle" class
import {Vector} from '../../Vector';
import {map} from '../../Utils';

export class Vehicle {
    acceleration = new Vector(0, 0);
    velocity = new Vector(0, 0);
    position: Vector;
    maxspeed = 4;
    maxforce = 0.1;
    distanceBeforeStopping = 100;


    constructor(x, y) {
        this.position = new Vector(x, y);
    }

    setMaxSpeed(maxspeed) {
        let speedMultiplier = maxspeed / this.maxspeed;
        this.maxspeed = maxspeed;
        this.maxforce = this.maxforce * speedMultiplier;
        this.distanceBeforeStopping = this.distanceBeforeStopping * speedMultiplier;
    };

    // Method to update location
    update() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        // Don't update the position if the velocity is really low
        if (this.velocity.lengthSquared() >= 0.5) {
            this.position.add(this.velocity);
        }
        // Reset accelerationelertion to 0 each cycle
        this.acceleration.multiplyScalar(0);
    };

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    };

    // A method that calculates a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    arrive(target) {
        const desired = target.clone().sub(this.position);  // A vector pointing from the location to the
        // target
        const d = desired.length();
        // Scale with arbitrary damping within 100 pixels
        if (d < this.distanceBeforeStopping) {
            const m = map(d, 0, this.distanceBeforeStopping, 0, this.maxspeed);
            desired.setLength(m);
        } else {
            desired.setLength(this.maxspeed);
        }

        // Steering = Desired minus Velocity
        const steer = desired.sub(this.velocity);
        steer.limit(this.maxforce);  // Limit to maximum steering force
        this.applyForce(steer);
    };
}
