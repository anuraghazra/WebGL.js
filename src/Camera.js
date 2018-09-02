function Camera(position, lookAt, up) {
  this.forward = vec3.create();
  this.up = vec3.create();
  this.right = vec3.create();

  this.position = position;
  this.lookAt = lookAt;

  vec3.subtract(this.forward, this.lookAt, this.position);
  vec3.cross(this.right, this.forward, up);
  vec3.cross(this.up, this.right, this.forward);

  vec3.normalize(this.forward, this.forward);
  vec3.normalize(this.right, this.right);
  vec3.normalize(this.up, this.up);

  this.pressedKeys = {
    up: false,
    right: false,
    down: false,
    left: false,

    rotLeft: false,
    rotRight: false,
    rotUp: false,
    rotDown: false,

    forward: false,
    back: false,
  }
  window.addEventListener('keydown', this.onKeyDown.bind(this));
  window.addEventListener('keyup', this.onKeyUp.bind(this));

  
}

Camera.prototype.getViewMatrix = function (out) {
  let lookAt = vec3.create();
  vec3.add(lookAt, this.position, this.forward);
  mat4.lookAt(out, this.position, lookAt, this.up);
  return out;
}

Camera.prototype.rotateRight = function (rad) {
  let rightMatrix = mat4.create();
  mat4.rotate(rightMatrix, rightMatrix, rad, vec3.fromValues(0, 0, 1));
  vec3.transformMat4(this.forward, this.forward, rightMatrix);
  this._realign();
}

Camera.prototype.rotateUp = function (rad) {
  let upMatrix = mat4.create();
  mat4.rotate(upMatrix, upMatrix, rad, vec3.fromValues(1, 0, 0));
  vec3.transformMat4(this.forward, this.forward, upMatrix);
  this._realign();
}

Camera.prototype._realign = function () {
  vec3.cross(this.right, this.forward, this.up);
  vec3.cross(this.up, this.right, this.forward);

  vec3.normalize(this.forward, this.forward);
  vec3.normalize(this.right, this.right);
  vec3.normalize(this.up, this.up);
}

Camera.prototype.moveForward = function (dist) {
  vec3.scaleAndAdd(this.position, this.position, this.forward, dist)
}
Camera.prototype.moveRight = function (dist) {
  vec3.scaleAndAdd(this.position, this.position, this.right, dist)
}
Camera.prototype.moveUp = function (dist) {
  vec3.scaleAndAdd(this.position, this.position, this.up, dist)
}


Camera.prototype.onKeyDown = function (e) {
  switch (e.code) {
    case 'KeyW':
      this.pressedKeys.forward = true;
      break;
    case 'KeyA':
      this.pressedKeys.left = true;
      break;
    case 'KeyD':
      this.pressedKeys.right = true;
      break;
    case 'KeyS':
      this.pressedKeys.back = true;
      break;
    case 'KeyQ':
      this.pressedKeys.up = true;
      break;
    case 'KeyE':
      this.pressedKeys.down = true;
      break;
    case 'ArrowRight':
      this.pressedKeys.rotRight = true;
      break;
    case 'ArrowLeft':
      this.pressedKeys.rotLeft = true;
      break;
    case 'ArrowUp':
      this.pressedKeys.rotUp = true;
      break;
    case 'ArrowDown':
      this.pressedKeys.rotDown = true;
      break;
  }
}
Camera.prototype.onKeyUp = function (e) {
  switch (e.code) {
    case 'KeyW':
      this.pressedKeys.forward = false;
      break;
    case 'KeyA':
      this.pressedKeys.left = false;
      break;
    case 'KeyD':
      this.pressedKeys.right = false;
      break;
    case 'KeyS':
      this.pressedKeys.back = false;
      break;
    case 'KeyQ':
      this.pressedKeys.up = false;
      break;
    case 'KeyE':
      this.pressedKeys.down = false;
      break;
    case 'ArrowRight':
      this.pressedKeys.rotRight = false;
      break;
    case 'ArrowLeft':
      this.pressedKeys.rotLeft = false;
      break;
    case 'ArrowUp':
      this.pressedKeys.rotUp = false;
      break;
    case 'ArrowDown':
      this.pressedKeys.rotDown = false;
      break;
  }
}

Camera.prototype.doMovement = function(viewMatrix) { 
  let moveSpeed = 0.2;
  let rotSpeed = 0.02;
  
  if (this.pressedKeys.forward && !this.pressedKeys.back) {
    this.moveForward(moveSpeed)
  }
  if (this.pressedKeys.back && !this.pressedKeys.forward) {
    this.moveForward(-moveSpeed)
  }

  if (this.pressedKeys.right && !this.pressedKeys.left) {
    this.moveRight(moveSpeed)
  }
  if (this.pressedKeys.left && !this.pressedKeys.right) {
    this.moveRight(-moveSpeed)
  }

  if (this.pressedKeys.rotRight && !this.pressedKeys.rotLeft) {
    this.rotateRight(-rotSpeed)
  }
  if (this.pressedKeys.rotLeft && !this.pressedKeys.rotRight) {
    this.rotateRight(rotSpeed)
  }
  if (this.pressedKeys.rotUp && !this.pressedKeys.rotDown) {
    this.rotateUp(-rotSpeed)
  }
  if (this.pressedKeys.rotDown && !this.pressedKeys.rotUp) {
    this.rotateUp(rotSpeed)
  }

  if (this.pressedKeys.up && !this.pressedKeys.down) {
    this.moveUp(moveSpeed)
  }
  if (this.pressedKeys.down && !this.pressedKeys.up) {
    this.moveUp(-moveSpeed)
  }

  this.getViewMatrix(viewMatrix);
}