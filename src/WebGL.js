
/**
 * @class WebGL
 * @param {*} id 
 * @param {*} width 
 * @param {*} height 
 */
function WebGL(id, width, height) {
  this.canvas = document.querySelector(id);
  this.width = width;
  this.height = height;
  this.canvas.width = width;
  this.canvas.height = height;

  this.gl = this.canvas.getContext('webgl');
  if (!this.gl) {
    console.log('falling back to experimental-webgl')
    this.gl = this.canvas.getContext('experimental-webgl');
  }
  if (!this.gl) {
    console.error('WEBGL Is Not Supported')
  }
  console.log('%cWebGL.js : WEBGL Enabled', 'color : green');

  this.videoloaded = false;

  this.res = 0;
  this.shaders = null;
  this.models = null;
  this.assets = null;

  this.meshes = [];
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
            that.shaders[i].vert = data.replace(/\s+\n/img, '\n');
          }
        });

        this.shaders[i].frag = this.loadFile(this.shaders[i].path + this.shaders[i].frag, function (err, data) {
          if (err) return;
          if (data) {
            that.shaders[i].frag = data.replace(/\s+\n/img, '\n');
          }
        });
    }
  }

  // * raw models
  for (const i in this.rawModels) {
    that.loadModel(that.rawModels[i], function(err, data) {
      if(err) return;
      if (data) {
        that.rawModels[i] = data;
      }
    })
  }


  // * models
  for (const i in this.models) {

    that.loadModel(that.models[i].mesh, function (err_model, data_model) {
      // debugger
      if (err_model) return;

      if (typeof that.models[i].tex === 'string') {
        that.loadImage(that.models[i].tex, function (err_tex, data_tex) {
          if (err_tex) return;
          if (data_tex) {
            that.models[i].tex = data_tex;
            console.log(that.models[i].tex instanceof HTMLImageElement)
            createMesh();
          }
        })
      } else if (typeof that.models[i].tex === 'boolean') {
        that.models[i].tex = true;
        createMesh();
      } else {
        that.models[i].tex = null;
        createMesh();
      }

      function createMesh() {
        if (data_model) {
          console.log(data_model)
          for (let j = 0; j < data_model.meshes.length; j++) {
            that.models[i + '_' + data_model.meshes[j].name] = new WebGL.Model(
              that,
              data_model.meshes[j],
              that.models[i].tex,
              data_model.rootnode.children[j].transformation
            );
            if (j === data_model.meshes.length - 1) {
              delete that.models[i];
            }
          }
        }
      }

    })

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
WebGL.prototype.setMVP = function(opt) {
  // Setting Matrices
  this.gl.uniformMatrix4fv(opt.world, this.gl.FALSE, this.uWorld);
  this.gl.uniformMatrix4fv(opt.view, this.gl.FALSE, this.uView);
  this.gl.uniformMatrix4fv(opt.proj, this.gl.FALSE, this.uProj);
}
WebGL.prototype.cameraPosition = function (x, y, z) {
  this.cam.position = new Float32Array([x, y, z]);
}
WebGL.prototype.doMovement = function(mat, time) {
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
  for (var i = 0, il = chunks.length; i < il; i ++) {
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
    let codeline = errorline + ' : ' + shaderString.split('\n')[errorline-1].trim();
    
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
  if(vserr) { console.warn('VERTEX SHADER : ', vserr); }
  let fserr = getShaderError(gl, fragmentShader, fsTex);
  if(fserr) { console.warn('FRAGMENT SHADER : ', fserr); }

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
  this.gl.vertexAttribPointer(
    pos,
    elements,
    isfloat,
    isnorm,
    stride,
    offset
  );
  this.gl.enableVertexAttribArray(pos);
}

/**
 * @method WebGL.getShaderVariables()
 * parse and get all shader locations automatically
 * @param {*} shader 
 * @param {*} program 
 */
WebGL.prototype.getShaderVariables = function (shader, program) {
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
      } else if (settings[i][0] instanceof WebGLTexture) {
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

  // Check For PowerOf2 Images
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, settings.WRAP_S || gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, settings.WRAP_T || gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, settings.MIN_FILTER || gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, settings.MIG_FILTER || gl.LINEAR);

  if (img instanceof HTMLImageElement) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  } else {
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                  1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  pixel);
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
      vec3 sun;
      vec3 dir;
    };
    
    uniform Light light;
    
    void main(void) {
    
      vec4 texel = texture2D(uSampler, vTexCoord);
    
      vec3 lightintensity = light.ambient + light.sun * max(dot(vNormal, light.dir), 0.0);
    
      gl_FragColor = vec4(texel.rgb * lightintensity, texel.a);
    }
    `
  }
}

WebGL.createSphere = function createSphere(options) {
  options = options || {};

  var long_bands = options.segs || 8;
  var lat_bands = options.rigns || 8;
  var radius = options.radius || 1;
  var lat_step = Math.PI / lat_bands;
  var long_step = 2 * Math.PI / long_bands;
  var num_positions = long_bands * lat_bands * 4;
  var num_indices = long_bands * lat_bands * 6;
  var lat_angle, long_angle;
  var positions = new Float32Array(num_positions * 3);
  var normals = new Float32Array(num_positions * 3);
  var uvs = new Float32Array(num_positions * 2);
  var indices = new Uint16Array(num_indices);
  var x1, x2, x3, x4,
      y1, y2,
      z1, z2, z3, z4,
      u1, u2,
      v1, v2;
  var i, j;
  var k = 0, l = 0;
  var vi, ti;

  for (i = 0; i < lat_bands; i++) {
    lat_angle = i * lat_step;
    y1 = Math.cos(lat_angle);
    y2 = Math.cos(lat_angle + lat_step);
    for (j = 0; j < long_bands; j++) {
      long_angle = j * long_step;
      x1 = Math.sin(lat_angle) * Math.cos(long_angle);
      x2 = Math.sin(lat_angle) * Math.cos(long_angle + long_step);
      x3 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle);
      x4 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle + long_step);
      z1 = Math.sin(lat_angle) * Math.sin(long_angle);
      z2 = Math.sin(lat_angle) * Math.sin(long_angle + long_step);
      z3 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle);
      z4 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle + long_step);
      u1 = 1 - j / long_bands;
      u2 = 1 - (j + 1) / long_bands;
      v1 = 1 - i / lat_bands;
      v2 = 1 - (i + 1) / lat_bands;
      vi = k * 3;
      ti = k * 2;

      positions[vi] = x1 * radius; 
      positions[vi+1] = y1 * radius; 
      positions[vi+2] = z1 * radius; //v0

      positions[vi+3] = x2 * radius; 
      positions[vi+4] = y1 * radius; 
      positions[vi+5] = z2 * radius; //v1

      positions[vi+6] = x3 * radius; 
      positions[vi+7] = y2 * radius; 
      positions[vi+8] = z3 * radius; // v2


      positions[vi+9] = x4 * radius; 
      positions[vi+10] = y2 * radius; 
      positions[vi+11] = z4 * radius; // v3

      normals[vi] = x1;
      normals[vi+1] = y1; 
      normals[vi+2] = z1;

      normals[vi+3] = x2;
      normals[vi+4] = y1; 
      normals[vi+5] = z2;

      normals[vi+6] = x3;
      normals[vi+7] = y2; 
      normals[vi+8] = z3;
      
      normals[vi+9] = x4;
      normals[vi+10] = y2; 
      normals[vi+11] = z4;

      uvs[ti] = u1; 
      uvs[ti+1] = v1; 
      
      uvs[ti+2] = u2; 
      uvs[ti+3] = v1;
      
      uvs[ti+4] = u1;
      uvs[ti+5] = v2; 
      
      uvs[ti+6] = u2;
      uvs[ti+7] = v2;

      indices[l    ] = k;
      indices[l + 1] = k + 1;
      indices[l + 2] = k + 2;
      indices[l + 3] = k + 2;
      indices[l + 4] = k + 1;
      indices[l + 5] = k + 3;

      k += 4;
      l += 6;
    }
  }

  let schema = {
    meshes : {
      0 : {
        name : 'box',
        vertices : positions,
        normals : normals,
        texturecoords : [uvs],
        indices: indices
      }
    }
  }
  return schema;
}
