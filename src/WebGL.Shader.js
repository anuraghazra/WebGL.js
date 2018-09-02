/**
 * @class WebGL.Shader
 */
WebGL.Shader = function(gl, shaderStr, type) {
  this.shaderText = shaderStr;
  this.shader = gl.createShader(type);
  this.gl = gl;

  this.gl.shaderSource(this.shader, this.shaderText.toString());
  this.gl.compileShader(this.shader);

  // Check For Shader Errors
  let err = this.getShaderError(this.gl, this.shader, this.shaderText);
  if(err) { 
    if (type === this.gl.VERTEX_SHADER) {
      console.warn('VERTEX SHADER : ', err);
    } else if  (type === this.gl.FRAGMENT_SHADER) {
      console.warn('FRAGMENT SHADER : ', err);
    }
  }

}
WebGL.Shader.prototype.attach = function(program) {
  this.gl.attachShader(program, this.shader);
}

WebGL.Shader.prototype.getShaderError = function(_gl, shader, shaderString) {
  if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
    let errorline = +_gl.getShaderInfoLog(shader).match(/ERROR:\s\d+:(\d+):/)[1];
    let codeline = errorline + ' : ' + shaderString.split('\n')[errorline-1].trim();
    
    return [_gl.getShaderInfoLog(shader), '--------', codeline, '--------'].join('\n');
    // return [_gl.getShaderInfoLog(shader), '________', addLineNumbers(shaderString)].join('\n');
  }
}

/**
 * @method WebGL.getShaderVariables()
 * parse and get all shader locations automatically
 * @param {*} shader 
 * @param {*} program 
 */
WebGL.Shader.prototype.getShaderVariables = function (program) {
  let shader = this.shaderText;

  if (!program.attribs) program.attribs = {};
  if (!program.uniforms) program.uniforms = {};

  function getVar(match) {
    return match.split(' ')[2].replace(';', '');
  }

  // * > Find Variables
  
  // regEx Taken From claygl.js
  let matchUnis = shader.match(/uniform\s+(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+([\s\S]*?);/g);
  let matchAttrs = shader.match(/attribute\s+(float|int|vec2|vec3|vec4)\s+([\s\S]*?);/g);
  // old regex
  // let matchAttrs = shader.match(/attribute\s(.*?);/img);
  // let matchUnis = shader.match(/uniform\s(.*?);/img);

  if ((matchAttrs)) {
    for (let i = 0; i < matchAttrs.length; i++) {
      let _var = getVar(matchAttrs[i]);
      program.attribs[_var] = this.gl.getAttribLocation(program, _var);
    }
  }

  if (matchUnis) {
    for (let i = 0; i < matchUnis.length; i++) {
      let _var = getVar(matchUnis[i]);
      program.uniforms[_var] = this.gl.getUniformLocation(program, _var)
    }
  }


  // * > Find Structs
  // let matchStruct = shader.match(/struct\s.*\w\s?\{(\s\n.*;){0,}/gm);
  let matchStruct = shader.match(/\bstruct.+?{(\n?[^\;]?.+?){0,}?\n?\};/mg);
  let matchStructVar = shader.match(/uniform\s[a-zA-Z\s]+;/img);


  if (matchStructVar === null || matchStruct === null) {
    return;
  }
  for (let i = 0; i < matchStructVar.length; i++) {
    for (let j = 0; j < matchStruct.length; j++) {
      let structname = matchStruct[j].split(' ')[1];
      let varname = matchStructVar[i].split(' ')[2].replace(';', '');

      if (matchStructVar[i].split(' ')[1] === structname) {
        // * filter Booleans and remove new line with second filter
        let struct = matchStruct[j].split(' ').filter(Boolean).filter(function (i) {
          return i.match('^\n$') === null;
        });

        // * get the actual uniform locaitons ('ambient, light };')
        for (let k = 4; k < struct.length; k += 2) {
          struct[k] = struct[k].replace(/\}|;|\n/g, '');
          let prop = (varname + '.' + struct[k]).replace('"', '').trim();
          program.uniforms[prop] = this.gl.getUniformLocation(program, prop);
        }
      }
    }
  }
}

/**
 * @method WebGL.getShaderVariables()
 * sets struct variables
 * @param {*} uniforms 
 * @param {*} lightname 
 * @param {*} settings 
 */
WebGL.Shader.prototype.setStructVariables = function (uniforms, lightname, settings) {
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
        this.useTexture(settings[i][0], uniforms[varname], settings[i][1]);
      }
    }
  }
}