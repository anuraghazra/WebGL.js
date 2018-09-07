/**
 * @class WebGL
 * @param {*} id 
 * @param {*} width 
 * @param {*} height 
 * @version 1.2.0
 * @author Anurag Hazra <hazru.anurag@gmail.com>
 * @github <https://github.com/anuraghazra>
 */
function WebGL(id, width, height) {
  this.canvas = document.querySelector(id);
  this.width = width;
  this.height = height;
  this.canvas.width = width;
  this.canvas.height = height;

  this.gl = this.canvas.getContext('webgl2');
  if (!this.gl) {
    console.log('%cWebGL.js : webgl2 not supported falling back to webgl', 
    'color : white; background : orange; padding : 2px; border-radius : 5px');
    this.gl = this.canvas.getContext('webgl');
  }
  if (!this.gl) {
    console.log('%WebGL.js :webgl not supported falling back to experimental-webgl', 
    'color : white; background : crimson; padding : 5px; border-radius : 5px');
    this.gl = this.canvas.getContext('experimental-webgl');
  }
  if (!this.gl) {
    console.error('WebGL.js : WEBGL Is Not Supported')
  }

  this.videoloaded = false;

  this.res = 0;
  this.shaders = null;
  this.models = null;
  this.assets = null;

  this.meshes = [];

  this.userdata = null;
}

WebGL.prototype.useShader = function (program) {
  this.gl.useProgram(program);
}

WebGL.prototype.addMesh = function (m) {
  this.meshes.push(m);
}

WebGL.prototype.renderMeshes = function (program, attrpos, texslot) {
  for (let i = 0; i < this.meshes.length; i++) {
    this.meshes[i].render(program, attrpos, texslot);
  }
}


/**
 * @method WebGL.init()
 * init all shaders
 * @param {*} shaders 
 */
WebGL.prototype.init = function (userdata) {
  this.userdata = userdata;
  this.shaders = userdata.shaders;
  this.models = userdata.models;
  this.rawModels = userdata.rawModels;
  this.onDone = userdata.onDone;
  this.assets = userdata.assets;

  let that = this;


  // load from script files
  function DOMShader(id) {
    let dom = document.querySelector(id);
    return dom.textContent;
  }
  // * shaders
  for (const i in this.shaders) {

    switch (this.shaders[i].type) {
      case 'DOM':
        this.shaders[i].vert = DOMShader(this.shaders[i].vert);
        this.shaders[i].frag = DOMShader(this.shaders[i].frag);
        that.res--;
        if (that.res < 0) that.res = 0;
        break;

      case 'STRING':
        this.shaders[i].vert = this.shaders[i].vert;
        this.shaders[i].frag = this.shaders[i].frag;
        that.res--;
        if (that.res < 0) that.res = 0;
        break;

      case 'URL':
        this.shaders[i].vert = this.loadFile(this.shaders[i].path + this.shaders[i].vert, function (err, data) {
          if (err) return;
          if (data) {
            // that.shaders[i].vert = data.replace(/\s+\n/img, '\n');
            parseShaderDirective(data, that.shaders[i], that.shaders[i].path, 'vert')
          }
        });
        
        this.shaders[i].frag = this.loadFile(this.shaders[i].path + this.shaders[i].frag, function (err, data) {
          if (err) return;
          if (data) {
            // that.shaders[i].frag = data.replace(/\s+\n/img, '\n');
            parseShaderDirective(data, that.shaders[i], that.shaders[i].path, 'frag');
          }
        });
    }
  }

  // parse shader's include directive
  function parseShaderDirective(str, shader, path, type) {
    let lines = str.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().match(/#include.*?;$/)) {
        let found = lines[i];
        found = found.replace(/;\s+/img, '');
        let shaderUrl = found.replace(/;\s/img, '').substring('#include'.length+2, found.length-1);
        that.loadFile(path + shaderUrl, function (err, data) {
          if (err) return;
          if (data) {
            lines[i] = data;
            let str = lines.join('\n');
            let parsed = str.replace(/\s+\n/img, '\n');
            shader[type] = parsed;
          }
        });
      } else {
        let parsed = str.replace(/\s+\n/img, '\n');
        shader[type] = parsed;
      }
    }
  }

  // * raw models
  for (const i in this.rawModels) {
    that.loadModel(that.rawModels[i], function (err, data) {
      if (err) return;
      if (data) {
        that.rawModels[i] = data;
      }
    })
  }


  // * models
  for (const i in this.models) {
    that.loadModel(that.models[i], function (err, data) {
      if (err) return;
      if (data) {
        that.models[i] = _createModel(data);
      }
    })
  }

  function _createModel(data) {
    let m = new WebGL.Model(that, {
      data : data,
    });
    return m;
  }

  // * Assets
  for (const i in this.assets) {
    if (that.assets[i].substr(that.assets[i].length - 4, that.assets[i].length) === '.mp4') {
      this.loadVideo(that.assets[i], function (err, vid) {
        if (err) return;
        that.assets[i] = vid;
      })
    } else {
      this.loadImage(that.assets[i], function (err, img) {
        if (err) return;
        that.assets[i] = img;
      })
    }
  }

  let t = window.setInterval(function () {
    if (that.res <= 0) {
      clearInterval(t);
      that.onDone();
    }
  }, 50);

}



WebGL.prototype.camera = function (opt) {
  this.cam = new Camera(
    vec3.fromValues(0, -10, 1.0),
    vec3.fromValues(-0, -0.1, 1.0),
    vec3.fromValues(0, 0.5, 1)
  )
  if (opt.pos) {
    this.cam.position = new Float32Array(opt.pos);
  }

  // Creating Matrices /- mWorld, mView, mProj
  this.uView = mat4.create();
  this.uWorld = mat4.create();
  this.uProj = mat4.create();
  mat4.identity(this.uWorld);
  mat4.lookAt(this.uView, [0, 0, -9], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(this.uProj, glMatrix.toRadian(opt.fov || 65), this.canvas.width / this.canvas.height, opt.near || 0.01, opt.far || 1000);
  this.setMVP({
    world: opt.world,
    view: opt.view,
    proj: opt.proj,
  })
}
WebGL.prototype.setMVP = function (opt) {
  // Setting Matrices
  this.gl.uniformMatrix4fv(opt.world, this.gl.FALSE, this.uWorld);
  this.gl.uniformMatrix4fv(opt.view, this.gl.FALSE, this.uView);
  this.gl.uniformMatrix4fv(opt.proj, this.gl.FALSE, this.uProj);
}
WebGL.prototype.cameraPosition = function (x, y, z) {
  this.cam.position = new Float32Array([x, y, z]);
}
WebGL.prototype.doMovement = function (mat, time) {
  this.cam.doMovement(mat, time)
}

/**
 * @method WebGL.Background()
 * init background colors
 * @param {*} r 
 * @param {*} g 
 * @param {*} b 
 * @param {*} a 
 */
WebGL.prototype.background = function (r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
  this.gl.clearColor(r, g, b, a);
  this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
}

/**
 * @method WebGL.enable3DDepth()
 * 
 */
WebGL.prototype.enable3DDepth = function () {
  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.enable(this.gl.CULL_FACE);
  this.gl.frontFace(this.gl.CCW)
  this.gl.cullFace(this.gl.BACK)
}

/**
 * @method WebGL.enableAlphaBlend()
 * 
 */
WebGL.prototype.enableAlphaBlend = function () {
  this.gl.enable(this.gl.BLEND);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
}

/**
 * @method addLineNumbers()
 * @borrows from claygl.js
 * @param {*} string 
 */
function addLineNumbers(string) {
  var chunks = string.split('\n');
  for (var i = 0, il = chunks.length; i < il; i++) {
    // Chrome reports shader errors on lines
    // starting counting from 1
    chunks[i] = (i + 1) + ': ' + chunks[i];
  }
  return chunks.join('\n');
}

// Return true or error msg if error happened
function getShaderError(_gl, shader, shaderString) {
  if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
    let errorline = +_gl.getShaderInfoLog(shader).match(/ERROR:\s\d+:(\d+):/)[1];
    let codeline = errorline + ' : ' + shaderString.split('\n')[errorline - 1].trim();

    return [_gl.getShaderInfoLog(shader), '--------', codeline, '--------'].join('\n');
    // return [_gl.getShaderInfoLog(shader), '________', addLineNumbers(shaderString)].join('\n');
  }
}

/**
 * @method WebGL.createProgram()
 * create a shader program
 * @param {*} vsTex 
 * @param {*} fsTex 
 */
WebGL.prototype.createProgram = function (vsTex, fsTex) {
  let gl = this.gl;
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vsTex.toString());
  gl.shaderSource(fragmentShader, fsTex.toString());

  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  // Check For Shader Errors
  let vserr = getShaderError(gl, vertexShader, vsTex);
  if (vserr) { console.warn('VERTEX SHADER : ', vserr); }
  let fserr = getShaderError(gl, fragmentShader, fsTex);
  if (fserr) { console.warn('FRAGMENT SHADER : ', fserr); }

  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('ERROR LINKING PROGRAM : ', gl.getProgramInfoLog(program))
    return;
  }

  this.getShaderVariables(vsTex, program);
  this.getShaderVariables(fsTex, program);
  program.wgl = this;
  return program;
}

/**
 * @method WebGL.makeBuffer()
 * make a array buffer
 * @param {*} type 
 * @param {*} data 
 */
WebGL.prototype.makeBuffer = function (type, data, remove) {
  let buffer = this.gl.createBuffer();
  this.gl.bindBuffer(type, buffer);
  this.gl.bufferData(type, data, this.gl.STATIC_DRAW);
  if (!remove) {
    this.gl.bindBuffer(type, null);
  }
  return buffer;
}

/**
 * @method WebGL.enableAttribs()
 * enableAttribs
 * @param {*} type 
 * @param {*} buffer 
 * @param {*} pos 
 * @param {*} elements 
 * @param {*} isfloat 
 * @param {*} isnorm 
 * @param {*} stride 
 * @param {*} offset 
 */
WebGL.prototype.enableAttribs = function ({ type, buffer, pos, elements, isfloat = this.gl.FLOAT, isnorm = false, stride = 0, offset = 0 }) {
  this.gl.bindBuffer(type, buffer);
  this.gl.enableVertexAttribArray(pos);
  this.gl.vertexAttribPointer(
    pos,
    elements,
    isfloat,
    isnorm,
    stride,
    offset
  );
}

/**
 * @method WebGL.getShaderVariables()
 * parse and get all shader locations automatically
 * @param {*} shader 
 * @param {*} program 
 */
WebGL.prototype.getShaderVariables = function (shader, program) {
  const TYPES_SEMANTIC = {
    'bool': '1i',
    'int': '1i',
    'sampler2D': 't',
    'samplerCube': 't',
    'float': '1f',
    'vec2': '2f',
    'vec3': '3f',
    'vec4': '4f',
    'ivec2': '2i',
    'ivec3': '3i',
    'ivec4': '4i',
    'mat2': 'm2',
    'mat3': 'm3',
    'mat4': 'm4'
  }
  if (!program.attribs) program.attribs = {};
  if (!program.uniforms) program.uniforms = {};

  function getVar(match) {
    return match.split(' ')[2].replace(';', '');
  }
  function getType(match) {
    return match.split(' ')[1].replace(';', '');
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
      console.log()
      program.attribs[_var] = this.gl.getAttribLocation(program, _var);
    }
  }
  
  if (matchUnis) {
    for (let i = 0; i < matchUnis.length; i++) {
      let _var = getVar(matchUnis[i]);
      program.uniforms[_var] = this.gl.getUniformLocation(program, _var)
      program.uniforms[_var].type = getType(matchUnis[i]);
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

        // var numUniforms = wgl.gl.getProgramParameter(program, wgl.gl.ACTIVE_UNIFORMS)
        // console.log({numUniforms})
        // let info = wgl.gl.getActiveUniform(program, 60)
        // console.log(info.name)
        // let u = wgl.gl.getUniformLocation(program, info.name);
        // console.log(u)
        // * get the actual uniform locaitons ('ambient, light };')
        for (let k = 4; k < struct.length; k += 2) {
          struct[k] = struct[k].replace(/\}|;|\n/g, '');
          let prop = (varname + '.' + struct[k]).replace('"', '').trim();
          program.uniforms[prop] = this.gl.getUniformLocation(program, prop);
          program.uniforms[prop].name = struct[k];
          program.uniforms[prop].type = struct[k-1];
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
WebGL.prototype.setStructVariables = function (uniforms, lightname, settings) {
  for (const i in settings) {
    if (settings.hasOwnProperty(i)) {
      let varname = (lightname + '.' + i).trim();
      if (typeof settings[i] === 'object' && !(settings[i][0] instanceof WebGLTexture)) {
        this.gl.uniform3f(uniforms[varname],
          settings[i][0], settings[i][1], settings[i][2])
      } else if (typeof settings[i] === 'number') {
        this.gl.uniform1f.call(this.gl, uniforms[varname],
          settings[i]);
      } else if (settings[i][0] instanceof WebGLTexture && !settings[i][0].empty) {
        this.useTexture(settings[i][0], uniforms[varname], settings[i][1]);
      }
    }
  }
}

WebGL.prototype.setVariable = function (locaton, data) {
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


WebGL.prototype.setupTexture = function (img, settings) {
  if (settings === undefined) settings = {};

  let gl = this.gl;
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Flip The UVs
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, (settings.FLIP_Y === undefined) ? true : settings.FLIP_Y);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, settings.WRAP_S || gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, settings.WRAP_T || gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, settings.MIN_FILTER || gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, settings.MIG_FILTER || gl.LINEAR);

  if (img instanceof HTMLImageElement) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  } else {
    // console.trace('Image Is Not instanceof HTMLImageElement');
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      settings.width||1, settings.height||1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      null);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

WebGL.prototype.useTexture = function (tex, loc, slot) {
  this.gl.activeTexture(this.gl['TEXTURE' + slot]);
  this.gl.uniform1i(loc, slot);
  this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
}

WebGL.prototype.updateTexture = function (texture, video) {
  const level = 0;
  const internalFormat = this.gl.RGBA;
  const srcFormat = this.gl.RGBA;
  const srcType = this.gl.UNSIGNED_BYTE;
  this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
    srcFormat, srcType, video);
}

WebGL.prototype.loadCubeMap = function (imgs) {
  if (imgs.length !== 6) return;

  let texture = this.gl.createTexture();
  this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);


  let width = 400;
  let height = 400;
  for (let i = 0; i < imgs.length; i++) {
    // this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE + i,
    //                   0, this.gl.RBGA, this.gl.RGBA,
    //                   this.gl.UNSIGNED_BYTE, imgs[i]
    //                   );
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
      0, this.gl.RGB, width, height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, imgs[i]
    );
  }
  // Check For PowerOf2 Images
  this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
  this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);

  this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
  return texture;
}

WebGL.Shaders = {
  Simple: {
    vs: `
    precision mediump float;
  
    attribute vec3 aPosition;
    varying vec3 vPos;
    
    uniform mat4 uWorld;
    uniform mat4 uProj;
    uniform mat4 uView;
    
    void main(void) {
      vPos = aPosition + 0.5;
      gl_Position = uProj * uView * uWorld * vec4(aPosition, 1.0);
    }
    `,
    fs: `
    precision mediump float;
    
    vec3 objectColor = vec3(1.0,0.0,0.0); 
    varying vec3 vPos;

    void main(void) {
      gl_FragColor = vec4(vPos, 1.0);
    }
    `
  },
  AmbientLight: {
    vs: `
    precision mediump float;

    attribute vec3 aPosition;
    attribute vec3 aColor;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;
    
    
    uniform mat4 uWorld;
    uniform mat4 uProj;
    uniform mat4 uView;
    
    
    varying vec2 vTexCoord;
    varying vec3 vNormal;
    
    void main(void) {
      vTexCoord = aTexCoord;
      vNormal = (uWorld * vec4(aNormal, 0.0)).xyz;
      gl_Position = uProj * uView * uWorld * vec4(aPosition, 1.0);
    }
    `,

    fs: `
    precision mediump float;

    varying vec2 vTexCoord;
    varying vec3 vNormal;
    
    uniform sampler2D uSampler;
    
    struct Light {
      vec3 ambient;
      vec3 diff_color;
      vec3 direction;
    };
    
    uniform Light light;
    
    void main(void) {
    
      vec4 texel = texture2D(uSampler, vTexCoord);
    
      vec3 lightintensity = light.ambient + light.diff_color * max(dot(vNormal, light.direction), 0.0);
    
      gl_FragColor = vec4(texel.rgb * lightintensity, texel.a);
    }
    `
  }
}

function radians(deg) {
  return glMatrix.toRadian(deg);
}
function degrees(deg) {
  return 180/Math.PI*deg
}