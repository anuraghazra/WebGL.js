function rand(min, max) {
  return min + Math.random() * max;
}
function Particle(x, y, z, pmat, program) {
  this.pos = new Vector(x, y, z);
  this.vel = new Vector(rand(-0.5, 1), rand(-3, 3));
  this.acc = new Vector(rand(-0.1, 0.1), rand(-0.1, 1.0));

  
  this.size = 5;
  this.alpha = 1;
  
  this.radius = 0.1;
  this.dieRate = 0.013
  
  this.pmat = pmat;
  this.program = program;
  this.p = new WebGL.Model(wgl, {
    material: this.pmat,
    pos: this.pos,
    program: this.program,
    data: WebGL.createSphere({radius : this.radius})
  });

  this.update = function () {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    this.alpha -= this.dieRate;
    if (this.alpha < 0) {
      this.alpha = 0;
    }

    this._pos = [this.pos.x, this.pos.y, -2];
    console.log(this._pos)
    this.p.translate(this._pos);
  }

  this.render = function() {
    this.p.render();
  }
  this.isDead = function () {
    if (this.alpha <= 0) {
      return true;
    }
    return false;
  }

  // this.boundary = function () {
  //   if (this.pos.y < 10) {
  //     this.acc.y -= this.acc.y;
  //     this.vel.y -= this.vel.y;
  //   }
  //   if (this.pos.y > CANVAS_HEIGHT - 10) {
  //     this.acc.y -= this.acc.y;
  //     this.vel.y -= this.vel.y;
  //   }
  //   if (this.pos.x < 10) {
  //     this.acc.x -= this.acc.x;
  //     this.vel.x -= this.vel.x;
  //   }
  //   if (this.pos.x > CANVAS_WIDTH - 10) {
  //     this.acc.x -= this.acc.x;
  //     this.vel.x -= this.vel.x;
  //   }
  // }

  // this.render = function () {
  //   c.push();
  //   c.blendMode('lighter');
  //   if (this.alpha < 0.09) {
  //     c.blendMode('destination-out');
  //   }
  //   c.alpha(this.alpha);
  //   c.image(this.img, this.pos.x, this.pos.y, 32, 32);
  //   c.pop();
  // }

}