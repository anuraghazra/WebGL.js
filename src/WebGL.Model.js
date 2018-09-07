/**
 * @class WebGL.Model
 * @param {WebGL Context} engine 
 * @param {object} settings 
 */
WebGL.Model = function (engine, settings) {
  this.wgl = engine;
  this.settings = settings;
  this.program = this.settings.program;

  // pos, rot, world
  this.pos = this.settings.pos || [0.0, 0.0, 0.0];
  this.rotation = [0, 0, 0];
  this.angle = glMatrix.toRadian(45);
  this.world = mat4.create();

  let {
    name,
    vertices,
    indices,
    normals,
    texcoord
  } = this.parseData(); // parse the data comming in

  this.matsettings = settings.material;
  this.wgl.gl.useProgram(this.program);
  if (this.matsettings) {
    // * if its instanceof WebGL.Material then copy the settings
    if (this.matsettings instanceof WebGL.Material) {
      this.material = this.matsettings;
    } else { // * else create a new WebGL.Material 
      this.material = new WebGL.Material(this.wgl, this.matsettings);
    }
    // initialize Material
    this.material.init(this.program, 'material');
  }

  // buffers
  // * if its instanceof WebGL.Model then just copy the data
  if ((this.settings.data instanceof WebGL.Model)) {
    this.vbo = this.settings.data.vbo;
    this.nbo = this.settings.data.nbo;
    this.ibo = this.settings.data.ibo;
    this.nPoints = this.settings.data.nPoints;
    if (this.settings.data.tbo) {
      this.tbo = this.settings.data.tbo;
    }
  } else { // * else create the buffers
    this.vbo = this.wgl.makeBuffer(this.wgl.gl.ARRAY_BUFFER, new Float32Array(vertices));
    this.nbo = this.wgl.makeBuffer(this.wgl.gl.ARRAY_BUFFER, new Float32Array(normals));
    this.ibo = this.wgl.makeBuffer(this.wgl.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
    this.nPoints = indices.length;
    // if (this.matsettings) {
    //   if (this.matsettings.diffuse !== null) {
    //     if (texcoord === null) {
    //       texcoord = indices;
    //     }
    //   }
    // }
    if (texcoord) {
      this.tbo = this.wgl.makeBuffer(this.wgl.gl.ARRAY_BUFFER, new Float32Array(texcoord));
    }
  }





  this.name = (name == undefined) ? null : name;
  mat4.translate(this.world, mat4.create(), this.pos);
  return this;
}

WebGL.Model.prototype.parseData = function () {
  // raw data
  var name, vertices, indices, normals, texcoord;
  if (!(this.settings.data instanceof WebGL.Model)) {

    name = this.settings.data.meshes[0].name;
    vertices = this.settings.data.meshes[0].vertices;
    indices = [];
    if (this.settings.data.meshes[0].faces) {
      indices = ([].concat.apply([], this.settings.data.meshes[0].faces) || this.settings.data.meshes[0].indices);
    } else {
      indices = this.settings.data.meshes[0].indices;
    }

    normals = this.settings.data.meshes[0].normals;
    texcoord = null;
    if (this.settings.data.meshes[0].texturecoords !== undefined) {
      texcoord = this.settings.data.meshes[0].texturecoords[0];
    }
  }

  return {
    name, vertices, indices, normals, texcoord
  }
}

WebGL.Model.prototype.setMaterial = function (material) {
  this.material = material;
}
WebGL.Model.prototype.setProgram = function (program) {
  this.program = program;
}
WebGL.Model.prototype.setParam = function(variables) {
  for (const i in variables) {
    if (this.hasOwnProperty(i)) {
      this[i] = variables[i];
      if (i === 'pos') {
        mat4.translate(this.world, mat4.create(), this.pos);
      }
    }
  }
}

WebGL.Model.prototype.rotateX = function (angle) {
  this.rotation[0] = 1;
  this.angle = angle;
  mat4.translate(this.world, mat4.create(), this.pos);
  mat4.rotate(this.world, this.world, this.angle, this.rotation);
}
WebGL.Model.prototype.rotateY = function (angle) {
  this.rotation[1] = 1;
  this.angle = angle;
  mat4.translate(this.world, mat4.create(), this.pos);
  mat4.rotate(this.world, this.world, this.angle, this.rotation);
}
WebGL.Model.prototype.rotateZ = function (angle) {
  this.rotation[2] = 1;
  this.angle = angle;
  mat4.translate(this.world, mat4.create(), this.pos);
  mat4.rotate(this.world, this.world, this.angle, this.rotation);
}
WebGL.Model.prototype.rotate = function (ax, ay, az) {
  // this.angle = angle;
  // mat4.translate(this.world, mat4.create(), this.pos);
  mat4.rotate(this.world, this.world, ax, [1,0,0]);
  mat4.rotate(this.world, this.world, ay, [0,1,0]);
  mat4.rotate(this.world, this.world, az, [0,0,1]);
}
WebGL.Model.prototype.translate = function (pos) {
  this.pos = pos;
  mat4.translate(this.world, mat4.create(), this.pos);
}

WebGL.Model.prototype.enableAttribs = function (vpos, npos, tpos) {
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

  if (this.nbo && npos !== undefined) {
    this.wgl.enableAttribs({
      type: this.wgl.gl.ARRAY_BUFFER,
      buffer: this.nbo,
      pos: npos,
      elements: 3,
      isfloat: this.wgl.gl.FLOAT,
      isnorm: this.wgl.gl.TRUE,
      stride: 3 * Float32Array.BYTES_PER_ELEMENT,
      offset: 0
    });
  }

  if (this.tbo !== undefined && tpos !== undefined) {
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

}

// WebGL.Model.prototype.clone = function() {
//   return new WebGL.Model(this.wgl, this.settings);
// }

WebGL.Model.prototype.render = function (attrpos) {
  let program = this.program;
  this.wgl.gl.useProgram(program);
  this.material && this.material.init(program, 'material');

  let gl = this.wgl.gl;
  this.wgl.setVariable(program.uniforms.uWorld, this.world);

  if (attrpos) {
    this.enableAttribs(program.attribs[attrpos[0]], program.attribs[attrpos[1]], program.attribs[attrpos[2]]);
  } else {
    this.enableAttribs(program.attribs.aPosition, program.attribs.aNormal, program.attribs.aTexCoord);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  gl.drawElements(gl.TRIANGLES, this.nPoints, gl.UNSIGNED_SHORT, 0);

  //cleanup
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  // gl.bindTexture(gl.TEXTURE_2D, null);
  // this.wgl.gl.useProgram(null);
}
WebGL.Model.prototype.clean = function () {
  this.material.clean();
  this.wgl.gl.deleteBuffer(this.vbo);
  this.wgl.gl.deleteBuffer(this.nbo);
  this.wgl.gl.deleteBuffer(this.tbo);
  this.wgl.gl.deleteBuffer(this.ibo);
  this.wgl.gl.bindBuffer(this.wgl.gl.ELEMENT_ARRAY_BUFFER, null);
  this.wgl.gl.bindTexture(this.wgl.gl.TEXTURE_2D, null);
}