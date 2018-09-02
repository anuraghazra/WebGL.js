/**
 * ! @extension WebGL.Mesh 
 * @class WebGL.Mesh()
 */

WebGL.BoxMesh = function (wgl, settings) {
  this.wgl = wgl;

  this.pos = settings.pos;

  this.rotation = [0, 0, 0];
  this.angle = glMatrix.toRadian(45);

  this.world = mat4.create();
  // mat4.translate(this.world, this.world, this.pos);

  let s = settings.scale;
  this.size = settings.size;
  this.scale = s;

  this.vertices =
    [
      -s, -s, -s, -s, -s, s, -s, s, s, -s, s, -s, -s, s, -s, -s, s, s, s, s, s, s, s, -s, s, s, -s, s, s, s, s, -s, s, s, -s, -s, s, -s, -s, s, -s, s, -s, -s, s, -s, -s, -s, -s, s, -s, s, s, -s, s, -s, -s, -s, -s, -s, s, s, s, -s, s, s, -s, -s, s, s, -s, s
    ];

  this.indices = [
    [
      0
      , 1
      , 2
    ]
    , [
      0
      , 2
      , 3
    ]
    , [
      4
      , 5
      , 6
    ]
    , [
      4
      , 6
      , 7
    ]
    , [
      8
      , 9
      , 10
    ]
    , [
      8
      , 10
      , 11
    ]
    , [
      12
      , 13
      , 14
    ]
    , [
      12
      , 14
      , 15
    ]
    , [
      16
      , 17
      , 18
    ]
    , [
      16
      , 18
      , 19
    ]
    , [
      20
      , 21
      , 22
    ]
    , [
      20
      , 22
      , 23
    ]
  ]

  this.texturecoords = [
    0, 0,
    0, 1,
    1, 1,
    1, 0,
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    1, 1,
    0, 1,
    0, 0,
    1, 0,
    1, 1,
    1, 0,
    0, 0,
    0, 1,
    0, 0,
    0, 1,
    1, 1,
    1, 0,
    1, 1,
    1, 0,
    0, 0,
    0, 1
  ]
  this.normals = [
    -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
  ]

  this.indices = [].concat.apply([], this.indices);

  this.vbo = this.wgl.makeBuffer(this.wgl.gl.ARRAY_BUFFER, new Float32Array(this.vertices));
  this.nbo = this.wgl.makeBuffer(this.wgl.gl.ARRAY_BUFFER, new Float32Array(this.normals));
  this.ibo = this.wgl.makeBuffer(this.wgl.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices));
  this.tbo = this.wgl.makeBuffer(this.wgl.gl.ARRAY_BUFFER, new Float32Array(this.texturecoords));

  this.nPoints = this.indices.length;

  if (settings.tex instanceof HTMLImageElement) {
    this.texture = this.wgl.setupTexture(settings.tex, {
      // WRAP_S : this.wgl.gl.REPEAT,
      // WRAP_T : this.wgl.gl.REPEAT,
    });
  }

  mat4.translate(this.world, mat4.create(), this.pos);

  return this;
}

WebGL.BoxMesh.prototype.rotateX = function (angle) {
  this.rotation[0] = 1;
  this.angle = angle;
  mat4.translate(this.world, mat4.create(), this.pos);
  mat4.rotate(this.world, this.world, this.angle, this.rotation);
}
WebGL.BoxMesh.prototype.rotateY = function (angle) {
  this.rotation[1] = 1;
  this.angle = angle;
  mat4.translate(this.world, mat4.create(), this.pos);
  mat4.rotate(this.world, this.world, this.angle, this.rotation);
}
WebGL.BoxMesh.prototype.rotateZ = function (angle) {
  this.rotation[2] = 1;
  this.angle = angle;
  mat4.translate(this.world, mat4.create(), this.pos);
  mat4.rotate(this.world, this.world, this.angle, this.rotation);
}

WebGL.BoxMesh.prototype.render = function (program, attrpos, texslot) {
  let gl = this.wgl.gl;
  this.wgl.setVariable(program.uniforms.mWorld, this.world);
  this.enableAttribs(program.attribs[attrpos[0]], program.attribs[attrpos[1]], program.attribs[attrpos[2]]);
  this.wgl.useTexture(this.texture, program.uniforms.sampler, texslot)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  gl.drawElements(gl.TRIANGLES, this.nPoints, gl.UNSIGNED_SHORT, 0);

  //cleanup
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

WebGL.BoxMesh.prototype.enableAttribs = function (vpos, npos, tpos) {
  this.wgl.enableAttribs({
    type: this.wgl.gl.ARRAY_BUFFER,
    buffer: this.vbo,
    pos: vpos,
    elements: 3,
    isfloat: this.wgl.gl.FLOAT,
    isnorm: this.wgl.gl.FALSE,
    stride: 3 * Float32Array.BYTES_PER_ELEMENT,
    offset: 0
  });

  this.wgl.enableAttribs({
    type: this.wgl.gl.ARRAY_BUFFER,
    buffer: this.nbo,
    pos: npos,
    elements: 3,
    isfloat: this.wgl.gl.FLOAT,
    isnorm: this.wgl.gl.FALSE,
    stride: 3 * Float32Array.BYTES_PER_ELEMENT,
    offset: 0
  });

  this.wgl.enableAttribs({
    type: this.wgl.gl.ARRAY_BUFFER,
    buffer: this.tbo,
    pos: tpos,
    elements: 2,
    isfloat: this.wgl.gl.FLOAT,
    isnorm: this.wgl.gl.TRUE,
    stride: 0,
    offset: 0
  });

}

// TODO WebGL.SphereMesh Implementation

function inherit(_child, _parent) {
  _child.super_ = _parent;
  _child.prototype = Object.create(_parent.prototype);
}
