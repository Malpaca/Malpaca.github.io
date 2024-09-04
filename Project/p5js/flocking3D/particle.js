class Particle {
    constructor() {
        //restricting factors
        this.r = 5;
        this.perception = 300;
        this.max_force = 1;
        this.max_speed = 10;
        this.direction;
        //vectors
        this.position = createVector(random(-length / 5, length / 5), random(-width / 5, width / 5), height / 2 + random(-height / 5, height / 5));
        this.velocity = p5.Vector.random3D();
        this.velocity.setMag(this.max_speed);
        this.acceleration = createVector();
    }

    flocking(flock, walls) {
        let steer = createVector();
        let alignments = this.alignment(flock);
        let cohesions = this.cohesion(flock);
        let separations = this.separation(flock);
        let boundary = this.bound();
        // let obsticles = this.wall(walls);
        steer.add(cohesions.mult(cohesionSlider.value()));
        steer.add(alignments.mult(alignSlider.value()));
        steer.add(separations.mult(separationSlider.value()));
        steer.add(boundary);
        // console.log(boundary, this.velocity);
        steer.limit(this.max_force);
        // steer.add(obsticles);
        this.acceleration = steer;
        this.update()
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.max_speed);
        this.position.add(this.velocity);
        // if (this.velocity.magSq() < 0.25){
        //   this.velocity.setMag(0.5)
        // } else {
        //
        // }
    }

    separation(flock) {
        let avoid = createVector();
        let total = 0
        for (let others of flock) {
            if (others instanceof Point) {
                others = others.userdata;
                //console.log("works", others);
            }
            if (this.in_view(others, -this.perception / 2)) {
                let diff = p5.Vector.sub(this.position, others.position);
                let d = p5.Vector.dist(this.position, others.position);
                avoid.add(diff.normalize().div(d));
                total++;
            }
        }
        if (total > 0) {
            avoid.div(total);
            avoid.setMag(this.max_speed);
            let steer = p5.Vector.sub(avoid, this.velocity);
            steer.normalize();
            return steer;
        } else {
            return createVector();
        }
    }

    cohesion(flock) {
        let desired_position = createVector();
        let total = 0
        for (let others of flock) {
            if (others instanceof Point) {
                others = others.userdata;
                //console.log("works", others);
            }
            if (this.in_view(others, 0)) {
                desired_position.add(others.position);
                total++;
            }
        }
        if (total > 0) {
            let desired_v = p5.Vector.sub(desired_position.div(total), this.position);
            desired_v.setMag(this.max_speed);
            let steer = p5.Vector.sub(desired_v, this.velocity);
            steer.normalize();
            return steer;
        } else {
            return createVector();
        }
    }

    alignment(flock) {
        let desired_v = createVector();
        for (let others of flock) {
            if (others instanceof Point) {
                others = others.userdata;
                //console.log("works", others);
            }
            if (this.in_view(others, 0)) {
                desired_v.add(others.velocity);
            }
        }
        if (desired_v.magSq() != 0) {
            desired_v.setMag(this.max_speed);
            let steer = p5.Vector.sub(desired_v, this.velocity);
            steer.normalize();
            return steer;
        } else {
            return createVector();
        }
    }

    bound() {
        let low = map(this.position.z, 0, height / 4, this.max_speed, 0, true);
        let high = map(this.position.z, 3 * height / 4, height, 0, this.max_speed, true);
        let steer = p5.Vector.sub(createVector(this.velocity.x, this.velocity.y, low - high).limit(this.max_speed), this.velocity);
        // steer.normalize();
        return steer
    }

    wall(walls) {
        let avoid = createVector();
        let total = 0
        for (let wall of walls) {
            if (this.in_view(wall, -2 * this.perception / 3)) {
                let diff = p5.Vector.sub(this.position, wall.position);
                avoid.add(diff.div(d));
                total++;
            }
        }
        if (total > 0) {
            avoid.div(total);
            avoid.setMag(this.max_speed);
            let steer = avoid.sub(this.velocity);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    in_view(others, additional) {
        let d = p5.Vector.dist(this.position, others.position);
        let diff = p5.Vector.sub(this.position, others.position);
        let angle = this.velocity.angleBetween(diff);
        return ((0 < d) && (d < (this.perception + additional)) && (angle < 2 * PI / 3));
    }

    edge() {
        if (this.position.x < -length / 2) {
            this.position.x = length / 2;
        } else if (this.position.x > length / 2) {
            this.position.x = -length / 2;
        }
        if (this.position.y < -width / 2) {
            this.position.y = width / 2;
        } else if (this.position.y > width / 2) {
            this.position.y = -width / 2;
        }
    }

    render(x) {
        // Draw a triangle rotated in the direction of velocity
        let r = createVector(this.velocity.x, this.velocity.y);
        let theta = r.heading() - PI / 2;
        // let theta = r.heading();
        let rr = createVector(r.mag(), this.velocity.z);
        // let phi = rr.heading() - PI/2;
        let phi = rr.heading();
        // console.log(this, r, rr, phi);
        let inter = map(this.position.z, height / 2 - height / 3, height / 2 + height / 3, 0, 1);
        // let scaling = map(this.position.z, 100, 500, 0.8, 1.25)
        let colorcode = lerpColor(color(0, 255, 255), color(0, 255, 0), inter);
        if (x == 0) {
            colorcode = color(255, 0, 0)
        }
        stroke(51);
        strokeWeight(0.01);
        // noStroke();
        push();
        translate(this.position.x, this.position.y, this.position.z);
        rotateZ(theta);
        rotateX(phi);
        // scale(scaling);
        specularMaterial(100, 100, 100);
        fill(colorcode)
        // ambientMaterial(colorcode);
        // scale(0.25);
        // model(bird);
        cone(this.r, this.r * 2.5, 24, 16);
        // beginShape();
        // vertex(this.r * 2.5, 0);
        // vertex(-this.r * 2.5, this.r);
        // vertex(-this.r * 2.5, -this.r);
        // endShape(CLOSE);
        pop();
    }

    show(x) {
        this.edge();
        this.render(x);
        stroke(0, 255, 0);
        //point(this.position.x, this.position.y);
        noFill();
        // arc(this.position.x, this.position.y, this.perception, this.perception, this.velocity.heading() - 2*PI/3, this.velocity.heading() + 2*PI/3, PIE);
    }

    evaluate(flock){
        for (let others of flock) {
            if (others instanceof Point) {
                others = others.userdata;
                //console.log("works", others);
            }
            if (this.in_view(others, 0)) {
                return -abs(p5.Vector.dist(this.position, others.position)-100);
            }
            else{
                return 0
            }
        }
    }
}
