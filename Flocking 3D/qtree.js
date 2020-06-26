class Point {
    constructor(x, y, z, userdata) {
        this.position = createVector(x, y, z);
        this.userdata = userdata;
    }
}

class Rectangle {
    constructor(x, y, z, half_x, half_y, half_z) {
        this.position = createVector(x, y, z);
        this.half_x = half_x;
        this.half_y = half_y;
        this.half_z = half_z;
    }

    contains(point) {
        return (point.position.x >= this.position.x - this.half_x &&
            point.position.x <= this.position.x + this.half_x &&
            point.position.y >= this.position.y - this.half_y &&
            point.position.y <= this.position.y + this.half_y &&
            point.position.z >= this.position.z - this.half_z &&
            point.position.z <= this.position.z + this.half_z);
    }

    intersects(rect) {
        return !(rect.position.x - rect.half_x > this.position.x + this.half_x ||
            rect.position.x + rect.half_x < this.position.x - this.half_x ||
            rect.position.y - rect.half_y > this.position.y + this.half_y ||
            rect.position.y + rect.half_y < this.position.y - this.half_y ||
            rect.position.z - rect.half_z > this.position.z + this.half_z ||
            rect.position.z + rect.half_z < this.position.z - this.half_z);
    }
}

class Circle {
    constructor(x, y, z, r) {
        this.position = createVector(x, y, z);
        this.r = r;
    }

    contains(point) {
        return p5.Vector.dist(this.position, point.position) <= this.r;
    }

    intersects(rect) {
        //closest x
        let x, y, z;
        if (this.position.x < (rect.position.x - rect.half_x)) {
            x = rect.position.x - rect.half_x;
        } else if (this.position.x > (rect.position.x + rect.half_x)) {
            x = rect.position.x + rect.half_x;
        } else {
            x = this.position.x;
        }
        //closest y
        if (this.position.y < (rect.position.y - rect.half_y)) {
            y = rect.position.y - rect.half_y;
        } else if (this.position.y > (rect.position.y + rect.half_y)) {
            y = rect.position.y + rect.half_y;
        } else {
            y = this.position.y;
        }
        //closest z
        if (this.position.z < (rect.position.z - rect.half_z)) {
            z = rect.position.z - rect.half_z;
        } else if (this.position.z > (rect.position.z + rect.half_z)) {
            z = rect.position.z + rect.half_z;
        } else {
            z = this.position.z;
        }

        return createVector(x, y, z).sub(this.position).magSq() <= this.r * this.r;
        // let d = createVector(abs(this.position.x - rect.position.x), abs(this.position.y - rect.position.y));
        //
        // if (d.x > (rect.half_x + this.r) || d.y > (rect.half_y + this.r)){
        //   return false;
        // }
        // if (d.x <= rect.half_x || d.y <= rect.half_y){
        //   return true;
        // }
        // return d.sub(rect.half_x, rect.half_y).magSq() <= (this.r * this.r);
    }
}

class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    subdivide() {
        let x = this.boundary.position.x;
        let y = this.boundary.position.y;
        let z = this.boundary.position.z;
        let half_x = this.boundary.half_x / 2;
        let half_y = this.boundary.half_y / 2;
        let half_z = this.boundary.half_z / 2;

        let tru = new Rectangle(x + half_x, y - half_y, z + half_z, half_x, half_y, half_z); //top right up
        this.tru = new QuadTree(tru, this.capacity);
        let tlu = new Rectangle(x - half_x, y - half_y, z + half_z, half_x, half_y, half_z); //top left up
        this.tlu = new QuadTree(tlu, this.capacity);
        let bru = new Rectangle(x + half_x, y + half_y, z + half_z, half_x, half_y, half_z); //bottom right up
        this.bru = new QuadTree(bru, this.capacity);
        let blu = new Rectangle(x - half_x, y + half_y, z + half_z, half_x, half_y, half_z); //bottom left up
        this.blu = new QuadTree(blu, this.capacity);

        let trd = new Rectangle(x + half_x, y - half_y, z - half_z, half_x, half_y, half_z); //top right down
        this.trd = new QuadTree(trd, this.capacity);
        let tld = new Rectangle(x - half_x, y - half_y, z - half_z, half_x, half_y, half_z); //top left down
        this.tld = new QuadTree(tld, this.capacity);
        let brd = new Rectangle(x + half_x, y + half_y, z - half_z, half_x, half_y, half_z); //bottom right down
        this.brd = new QuadTree(brd, this.capacity);
        let bld = new Rectangle(x - half_x, y + half_y, z - half_z, half_x, half_y, half_z); //bottom left down
        this.bld = new QuadTree(bld, this.capacity);

        this.divided = true;
    }

    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        return (this.tru.insert(point) ||
            this.tlu.insert(point) ||
            this.bru.insert(point) ||
            this.blu.insert(point) ||
            this.trd.insert(point) ||
            this.tld.insert(point) ||
            this.brd.insert(point) ||
            this.bld.insert(point));
    }

    query(range, found) {
        if (!found) {
            found = [];
        }
        if (!range.intersects(this.boundary)) {
            return found;
        }
        for (let p of this.points) {
            if (range.contains(p)) {
                found.push(p);
            }
        }
        if (this.divided) {
            this.tru.query(range, found);
            this.tlu.query(range, found);
            this.bru.query(range, found);
            this.blu.query(range, found);
            this.trd.query(range, found);
            this.tld.query(range, found);
            this.brd.query(range, found);
            this.bld.query(range, found);
        }

        return found;
    }

    show() {
        stroke(255);
        strokeWeight(1);
        noFill();
        rectMode(CENTER);
        rect(this.boundary.position.x, this.boundary.position.y, this.boundary.half_x * 2, this.boundary.half_y * 2);
        if (this.divided) {
            this.top_right.show();
            this.top_left.show();
            this.bottom_right.show();
            this.bottom_left.show();
        }
        for (let p of this.points) {
            strokeWeight(3);
            point(p.position.x, p.position.y)
        }
    }
}
