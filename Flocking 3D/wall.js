class Wall {
  constructor(x, y) {
    this.position = createVector(x, y);
  }

  show() {
    ellipse(this.position.x, this.position.y, 5, 5);
  }
}
