/**
 * @class WebGL.Material
 * @param {WebGL Context} wgl 
 * @param {object} settings 
 */
WebGL.Material = function(wgl, settings) {
  this.wgl = wgl;
  // * variables
  this.useTexture = settings.useTexture || 0;
  this.shadeless = settings.shadeless || 0;
  this.color = settings.color || [1.0,0.0,0.0];
  this.shininess = settings.shininess || 32.0;
  this.ambient = settings.ambient || [0.5,0.5,0.5];
  this.diff_color = settings.diff_color || [1.0,1.0,1.0];
  this.spec_color = settings.spec_color || [1.0,1.0,1.0];
  this.blinn = (settings.useBlinnShading == undefined) ? 1 : settings.useBlinnShading;
  this.specularIntensity = settings.specularIntensity || 1.0;

  if(settings.diffuse instanceof HTMLImageElement) {
    this.diffuse = this.wgl.setupTexture(settings.diffuse, {});
  } else if (settings.diffuse instanceof WebGLTexture) {
    this.diffuse = settings.diffuse;
  }
  if(settings.specular instanceof HTMLImageElement) {
    this.specular = this.wgl.setupTexture(settings.specular, {});
  } else if (settings.diffuse instanceof WebGLTexture) {
    this.specular = settings.specular;
  }

  // TODO 
  if (!this.diffuse && !this.specular) {
    this.useTexture = 0;
    this.diffuse = this.wgl.setupTexture(null, {});
    this.specular = this.wgl.setupTexture(null, {});
  }

  return this;
}

WebGL.Material.prototype.init = function(program, name) {
  this.wgl.setStructVariables(program.uniforms, name, {
    ambient : this.ambient,
    color : this.color,
    shadeless : this.shadeless,
    useTexture : this.useTexture,
    diffuse : [this.diffuse, 0],
    specular : [this.specular, 1],
    diff_color : this.diff_color,
    spec_color : this.spec_color,
    shininess : this.shininess,
    specularIntensity : this.specularIntensity,
    blinn : this.blinn
  });
}
WebGL.Material.prototype.clean = function() {
  this.wgl.gl.deleteTexture(this.diffuse);
  this.wgl.gl.deleteTexture(this.specular);
}



/**
 * @class WebGL.PointLight
 * @param {WebGLProgram} program 
 * @param {int} index 
 * @param {object} data 
 */
WebGL.PointLight = function(program, index, data) {
  this.pos = data.pos || [1.0, 1.0, 1.0];
  this.ambient = data.ambient || [0.5, 0.5, 0.5];
  this.diffuse = data.diffuse || [1.0, 1.0, 1.0];
  this.specular = data.specular || [1.0, 1.0, 1.0];
  this.constant = data.constant || 1.0;
  this.linear = data.linear || 0.035;
  this.quadratic = data.quadratic || 0.044;
  this.program = program;

  this.renderable = false;
  if (data.mesh) {
    this.mesh = new WebGL.Model(this.program.wgl, {
      material : {
        shadeless : 1,
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
WebGL.PointLight.prototype.setVariables = function() {
  let wgl = this.program.wgl;
  this._pos = wgl.gl.getUniformLocation(this.program, 'pointlights['+this.index+'].position');
  this._diff = wgl.gl.getUniformLocation(this.program, 'pointlights['+this.index+'].diffuse');
  this._ambi = wgl.gl.getUniformLocation(this.program, 'pointlights['+this.index+'].ambient');
  this._spec = wgl.gl.getUniformLocation(this.program, 'pointlights['+this.index+'].specular');
  this._cons = wgl.gl.getUniformLocation(this.program, 'pointlights['+this.index+'].constant');
  this._line = wgl.gl.getUniformLocation(this.program, 'pointlights['+this.index+'].linear');
  this._quad = wgl.gl.getUniformLocation(this.program, 'pointlights['+this.index+'].quadratic');
  
  wgl.setVariable(this._pos, this.pos);
  wgl.setVariable(this._ambi, this.ambient);
  wgl.setVariable(this._diff, this.diffuse);
  wgl.setVariable(this._spec, this.specular);
  wgl.setVariable(this._cons, this.constant);
  wgl.setVariable(this._line, this.linear);
  wgl.setVariable(this._quad, this.quadratic);
}

WebGL.PointLight.prototype.render = function () {
  if (this.renderable) {
    this.mesh.render();
  }
}
WebGL.PointLight.prototype.setPosition = function(pos) {
  this.pos = pos;
  if (this.renderable) {
    this.mesh.translate(pos);
  }
  this.program.wgl.setVariable(this._pos, this.pos);
}


WebGL.SunLight = function(program, index, data) {
  this.direction = data.direction || [1.0, 1.0, 1.0];
  this.ambient = data.ambient || [0.2, 0.2, 0.2];
  this.diffuse = data.diffuse || [1.0, 1.0, 1.0];
  this.specular = data.specular || [1.0, 1.0, 1.0];
  this.program = program;
  
  this.index = index;
  this.setVariables();
}
WebGL.SunLight.prototype.setVariables = function() {
  let wgl = this.program.wgl;
  this._dir = wgl.gl.getUniformLocation(this.program, 'dirlight['+this.index+'].direction');
  this._ambi = wgl.gl.getUniformLocation(this.program, 'dirlight['+this.index+'].ambient');
  this._diff = wgl.gl.getUniformLocation(this.program, 'dirlight['+this.index+'].diffuse');
  this._spec = wgl.gl.getUniformLocation(this.program, 'dirlight['+this.index+'].specular');
  
  wgl.setVariable(this._dir, this.direction);
  wgl.setVariable(this._ambi, this.ambient);
  wgl.setVariable(this._diff, this.diffuse);
  wgl.setVariable(this._spec, this.specular);
}
WebGL.SunLight.prototype.setDirection = function(direction) {
  this.direction = direction;
  this.program.wgl.setVariable(this._dir, this.direction);
}