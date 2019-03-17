/**
 * @class WebGL.Material
 * @param {WebGL Context} wgl 
 * @param {object} settings 
 */
WebGL.Material = function (wgl, settings) {
  this.wgl = wgl;
  // * variables
  this.useTexture = settings.useTexture || 0;
  this.shadeless = settings.shadeless || 0;
  this.color = settings.color || [1.0, 0.0, 0.0];
  this.shininess = settings.shininess || 32.0;
  this.ambient = settings.ambient || [0.5, 0.5, 0.5];
  this.diff_color = settings.diff_color || [1.0, 1.0, 1.0];
  this.spec_color = settings.spec_color || [1.0, 1.0, 1.0];
  this.blinn = (settings.useBlinnShading == undefined) ? 1 : settings.useBlinnShading;
  this.specularIntensity = settings.specularIntensity || 1.0;
  this.texture_settings = settings.texture_settings || {};

  if (settings.diffuse instanceof HTMLImageElement) {
    this.diffuse = this.wgl.setupTexture(settings.diffuse, this.texture_settings);
  } else if (settings.diffuse instanceof WebGLTexture) {
    this.diffuse = settings.diffuse;
  }
  if (settings.specular instanceof HTMLImageElement) {
    this.specular = this.wgl.setupTexture(settings.specular, this.texture_settings);
  } else if (settings.specular instanceof WebGLTexture) {
    this.specular = settings.specular;
  }

  // TODO Fix Texture Making If the diffuse and specular maps are unavailable
  if (!this.diffuse && !this.specular) {
    this.useTexture = 0;
    this.diffuse = this.wgl.setupTexture(null, {});
    this.specular = this.wgl.setupTexture(null, {});
    this.diffuse.empty = true;
    this.specular.empty = true;
  }

  return this;
}

WebGL.Material.prototype.init = function (program, name) {
  this.wgl.setStructVariables(program.uniforms, name, {
    ambient: this.ambient,
    color: this.color,
    shadeless: this.shadeless,
    useTexture: this.useTexture,
    diffuse: [this.diffuse, 0],
    specular: [this.specular, 1],
    diff_color: this.diff_color,
    spec_color: this.spec_color,
    shininess: this.shininess,
    specularIntensity: this.specularIntensity,
    blinn: this.blinn
  });
  if (this.diffuse.empty) {
    this.wgl.gl.deleteTexture(this.diffuse);
  }
  if (this.specular.empty) {
    this.wgl.gl.deleteTexture(this.specular);
  }
}
WebGL.Material.prototype.clean = function () {
  this.wgl.gl.deleteTexture(this.diffuse);
  this.wgl.gl.deleteTexture(this.specular);
}



/**
 * @class WebGL.PointLight
 * @param {WebGLProgram} program 
 * @param {int} index 
 * @param {object} data 
 */
WebGL.PointLight = function (program, index, data) {
  this.pos = data.pos || [1.0, 1.0, 1.0];
  this.ambient = data.ambient || [0.5, 0.5, 0.5];
  this.diffuse = data.diffuse || [1.0, 1.0, 1.0];
  this.specular = data.specular || [1.0, 1.0, 1.0];
  this.constant = 1.0;
  this.linear = 0.035;
  this.quadratic = 0.044;
  this.program = program;

  this.renderable = false;
  if (data.mesh) {
    this.mesh = new WebGL.Model(this.program.wgl, {
      material: {
        shadeless: 1,
        useTexture: 0,
        diff_color: this.diffuse,
      },
      pos: this.pos,
      program: this.program,
      data: data.mesh
    });
    this.renderable = true;
  }

  this.index = index;
  this.setVariables();
}
WebGL.PointLight.prototype.setVariables = function () {
  let wgl = this.program.wgl;
  this._pos = wgl.gl.getUniformLocation(this.program, 'pointlights[' + this.index + '].position');
  this._diff = wgl.gl.getUniformLocation(this.program, 'pointlights[' + this.index + '].diffuse');
  this._ambi = wgl.gl.getUniformLocation(this.program, 'pointlights[' + this.index + '].ambient');
  this._spec = wgl.gl.getUniformLocation(this.program, 'pointlights[' + this.index + '].specular');
  this._cons = wgl.gl.getUniformLocation(this.program, 'pointlights[' + this.index + '].constant');
  this._line = wgl.gl.getUniformLocation(this.program, 'pointlights[' + this.index + '].linear');
  this._quad = wgl.gl.getUniformLocation(this.program, 'pointlights[' + this.index + '].quadratic');

  wgl.setVariable(this._pos, this.pos);
  wgl.setVariable(this._ambi, this.ambient);
  wgl.setVariable(this._diff, this.diffuse);
  wgl.setVariable(this._spec, this.specular);
  wgl.setVariable(this._cons, this.constant);
  wgl.setVariable(this._line, this.linear);
  console.log(this._quad, this.quadratic)
  wgl.setVariable(this._quad, this.quadratic);
}

WebGL.PointLight.prototype.render = function () {
  if (this.renderable) {
    this.mesh.render();
  }
}
WebGL.PointLight.prototype.setPosition = function (pos) {
  this.pos = pos;
  if (this.renderable) {
    this.mesh.translate(pos);
  }
  this.program.wgl.setVariable(this._pos, this.pos);
}


WebGL.SunLight = function (program, index, data) {
  this.direction = data.direction || [1.0, 1.0, 1.0];
  this.ambient = data.ambient || [0.2, 0.2, 0.2];
  this.diffuse = data.diffuse || [1.0, 1.0, 1.0];
  this.specular = data.specular || [1.0, 1.0, 1.0];
  this.program = program;

  this.index = index;
  this.setVariables();
}
WebGL.SunLight.prototype.setVariables = function () {
  let wgl = this.program.wgl;
  this._dir = wgl.gl.getUniformLocation(this.program, 'dirlight[' + this.index + '].direction');
  this._ambi = wgl.gl.getUniformLocation(this.program, 'dirlight[' + this.index + '].ambient');
  this._diff = wgl.gl.getUniformLocation(this.program, 'dirlight[' + this.index + '].diffuse');
  this._spec = wgl.gl.getUniformLocation(this.program, 'dirlight[' + this.index + '].specular');

  wgl.setVariable(this._dir, this.direction);
  wgl.setVariable(this._ambi, this.ambient);
  wgl.setVariable(this._diff, this.diffuse);
  wgl.setVariable(this._spec, this.specular);
}
WebGL.SunLight.prototype.setDirection = function (direction) {
  this.direction = direction;
  this.program.wgl.setVariable(this._dir, this.direction);
}


WebGL.SpotLight = function (program, index, data) {
  this.direction = data.direction || [1.0, 1.0, 1.0];
  this.position = data.position || [1.0, 1.0, 1.0];
  this.ambient = data.ambient || [0.2, 0.2, 0.2];
  this.diffuse = data.diffuse || [1.0, 1.0, 1.0];
  this.specular = data.specular || [1.0, 1.0, 1.0];
  this.cutOff = data.cutOff || 2.0;
  this.outerCutOff = data.outerCutOff || 2.0;
  this.program = program;

  this.renderable = false;
  if (data.mesh) {
    this.mesh = new WebGL.Model(this.program.wgl, {
      material: {
        shadeless: 1,
        useTexture: 0,
        diff_color: this.diffuse,
      },
      pos: this.position,
      program: this.program,
      data: data.mesh
    });
    this.renderable = true;
    console.log(this.direction)
    this.mesh.rotate((this.direction[0]), (this.direction[1]), (this.direction[2]));
  }

  this.index = index;
  this.setVariables();
}
WebGL.SpotLight.prototype.setVariables = function () {
  let wgl = this.program.wgl;
  this._dir = wgl.gl.getUniformLocation(this.program, 'spotlights[' + this.index + '].direction');
  this._pos = wgl.gl.getUniformLocation(this.program, 'spotlights[' + this.index + '].position');
  this._coff = wgl.gl.getUniformLocation(this.program, 'spotlights[' + this.index + '].cutOff');
  this._coff_out = wgl.gl.getUniformLocation(this.program, 'spotlights[' + this.index + '].outerCutOff');
  this._ambi = wgl.gl.getUniformLocation(this.program, 'spotlights[' + this.index + '].ambient');
  this._diff = wgl.gl.getUniformLocation(this.program, 'spotlights[' + this.index + '].diffuse');
  this._spec = wgl.gl.getUniformLocation(this.program, 'spotlights[' + this.index + '].specular');

  wgl.setVariable(this._dir, this.direction);
  wgl.setVariable(this._pos, this.position);
  wgl.setVariable(this._coff, this.cutOff);
  wgl.setVariable(this._coff_out, this.outerCutOff);
  wgl.setVariable(this._ambi, this.ambient);
  wgl.setVariable(this._diff, this.diffuse);
  wgl.setVariable(this._spec, this.specular);
}
WebGL.SpotLight.prototype.setDirection = function (direction) {
  this.direction = direction;
  this.program.wgl.setVariable(this._dir, this.direction);
}
WebGL.SpotLight.prototype.setPosition = function (position) {
  this.position = position;
  this.program.wgl.setVariable(this._pos, this.position);
}
WebGL.SpotLight.prototype.render = function () {
  if (this.renderable) {
    this.mesh.render();
  }
}