/**
 * @class WebGL.Program
 */
WebGL.Program = function(wgl, vsTex, fsTex) {
  this.gl = wgl.gl;
  this.wgl = wgl;
  let gl = this.gl;

  this.vsShader = new WebGL.Shader(gl, vsTex.toString(), gl.VERTEX_SHADER);
  this.fsShader = new WebGL.Shader(gl, fsTex.toString(), gl.FRAGMENT_SHADER);

  this.program = gl.createProgram();
  this.vsShader.attach(this.program);
  this.fsShader.attach(this.program);
  gl.linkProgram(this.program);

  if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
    console.warn('ERROR LINKING PROGRAM : ', gl.getProgramInfoLog(this.program))
    return;
  }

  this.vsShader.getShaderVariables(this.program);
  this.fsShader.getShaderVariables(this.program);
  this.program.wgl = wgl;

  return this;
}

WebGL.Program.prototype.useProgram = function() {
  this.gl.useProgram(this.program);
}

/**
 * @method WebGL.getShaderVariables()
 * sets struct variables
 * @param {*} uniforms 
 * @param {*} lightname 
 * @param {*} settings 
 */
WebGL.Program.prototype.setStructVariables = function (uniforms, lightname, settings) {
  console.log(uniforms)
  uniforms = this.program.uniforms;
  for (const i in settings) {
    if (settings.hasOwnProperty(i)) {
      let varname = (lightname + '.' + i).trim();
      if (typeof settings[i] === 'object' && !(settings[i][0] instanceof WebGLTexture)) {
        this.gl.uniform3f(uniforms[varname],
          settings[i][0], settings[i][1], settings[i][2])
      } else if (typeof settings[i] === 'number') {
        this.gl.uniform1f.call(this.gl, uniforms[varname],
          settings[i]);
      } else if (settings[i][0] instanceof WebGLTexture) {
        this.wgl.useTexture(settings[i][0], uniforms[varname], settings[i][1]);
      }
    }
  }
}

WebGL.Program.prototype.setVariable = function (locaton, data) {
  if (typeof data === 'object') {
    switch (data.length) {
      case 2:
        this.gl.uniform2fv(
          locaton,
          data
        );
        break;
      case 3:
        this.gl.uniform3fv(
          locaton,
          data
        );
        break;
      case 4:
        this.gl.uniform4fv(
          locaton,
          data
        );
        break;
      case 16:
        this.gl.uniformMatrix4fv(
          locaton,
          false,
          data
        );
        break;
      case 9:
        this.gl.uniformMatrix3fv(
          locaton,
          false,
          data
        );
        break;
    }
  }
  if (typeof data === 'number') {
    this.gl.uniform1f(
      locaton,
      data
    );
  }
}