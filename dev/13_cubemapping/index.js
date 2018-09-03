let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
window.onload = function () {

  wgl.init({
    shaders: {
      modular: {
        type: 'URL',
        path: '../../assets/shaders/',
        vert: 'modular.vs.glsl',
        frag: 'modular.fs.glsl',
      },
      cubemap: {
        type: 'URL',
        path: './',
        vert: 'cubemap.vs.glsl',
        frag: 'cubemap.fs.glsl',
      }
    },
    rawModels: {
      robot: '../../assets/models/robot.json',
    },
    assets: {
      robot: '../../assets/textures/robot.jpg',
      robotspec: '../../assets/textures/robot_spec.jpg',
      0: '../../assets/textures/skybox/nx.jpg',
      1: '../../assets/textures/skybox/ny.jpg',
      2: '../../assets/textures/skybox/nz.jpg',
      3: '../../assets/textures/skybox/px.jpg',
      4: '../../assets/textures/skybox/py.jpg',
      5: '../../assets/textures/skybox/pz.jpg',
    },
    onDone: onDone
  });

  function onDone() {
    let gl = wgl.gl;
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    let cubeProgram = wgl.createProgram(wgl.shaders.cubemap.vert, wgl.shaders.cubemap.frag);
    console.log(cubeProgram)

    // Load Models
    let mat3 = new WebGL.Material(wgl, {
      useTexture: 1,
      useBlinnShading: 1,
      shadeless: 0,
      diffuse: wgl.assets.robot,
      specular: wgl.assets.robotspec,
      diff_color: [1, 1, 1],
      spec_color: [1.0, 1.0, 1.0],
      ambient: [0.1, 0.1, 0.1],
      specularIntensity: 1.0,
      shininess: 128.0,
    });

    let robot1 = new WebGL.Model(wgl, {
      material: mat3,
      pos: [2, 0, -1.5],
      program: program,
      data: wgl.rawModels.robot,
    });
    robot1.rotateZ(glMatrix.toRadian(180));


    // lamp
    let light = new WebGL.PointLight(program, 0, {
      pos: [-1, -1, 2],
      diffuse: [1.0, 1.0, 1.0],
      ambient: [0.0, 0.0, 0],
      specular: [1.0, 1.0, 1.0],
      mesh: WebGL.createSphere({ radius: 0.1 }),
    });

    wgl.camera({
      pos: [0, -4, 2],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction: [0.0, -5.0, -10.0],
      ambient: [0.2, 0.2, 0.2],
      diffuse: [1.0, 1.0, 1.0],
      specular: [5.0, 5.0, 5.0],
    });
    console.log(program);

    let cubemaptexture = wgl.loadCubeMap([
      wgl.assets[0],
      wgl.assets[1],
      wgl.assets[2],
      wgl.assets[3],
      wgl.assets[4],
      wgl.assets[5],
    ]);

    var vertices = [ // X Y Z            U , V
      // positions          
      -1.0,  1.0, -1.0,
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
      -1.0,  1.0, -1.0,

      -1.0, -1.0,  1.0,
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0,

       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,

      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0
    ];

    var indices = [
      // TOP
      0, 1, 2,
      0, 2, 3,

      // LEFT
      5, 4, 6,
      6, 4, 7,

      // RIGHT
      8, 9, 10,
      8, 10, 11,

      // FRONT
      13, 12, 14,
      15, 14, 12,

      // BACK
      16, 17, 18,
      16, 18, 19,

      // BOTTOM
      21, 20, 22,
      22, 20, 23
    ];

    function getEmptyProj() {
      let mat = new Float32Array(wgl.uView);
      mat[12] = mat[13] = mat[14] = 0.0;
      return mat;
    }


    
    
    // cubemap
    let p = mat4.create();
    let projection = mat4.perspective(p, glMatrix.toRadian(65), wgl.canvas.width / wgl.canvas.height, 0.01, 1000);
    wgl.useShader(cubeProgram);


    let vbo = wgl.makeBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices));
    wgl.enableAttribs({
      buffer : vbo,
      pos : cubeProgram.uniforms.aPos,
      elements : 3,
      stride : 3 * Float32Array.BYTES_PER_ELEMENT,
    })
    // this.gl.bindBuffer(type, buffer);

    // gl.vertexAttribPointer(
    //   cubeProgram.uniforms.aPos,
    //   3,
    //   gl.FLOAT,
    //   gl.FALSE,
    //   3 * Float32Array.BYTES_PER_ELEMENT,
    //   0
    // );
    // gl.enableVertexAttribArray(cubeProgram.uniforms.aPos);
    let nbo = wgl.makeBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices))

    
    function animate(time) {
      // wgl.background();
      
      
      wgl.useShader(cubeProgram);
      wgl.setVariable(cubeProgram.uniforms.projection, projection);
      wgl.setVariable(cubeProgram.uniforms.view, wgl.cam.getViewMatrix(wgl.uView));
      
      gl.depthMask(gl.FALSE);
      // tex
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemaptexture);
      gl.uniform1i(program.uniforms.skybox, 0);
      // draw 
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nbo);
      gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
      gl.depthMask(gl.TRUE);

      gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

      // use program
      wgl.useShader(program);
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      robot1.render();

      light.render();
      wgl.gl.bindBuffer(wgl.gl.ELEMENT_ARRAY_BUFFER, null)

      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    animate();
  }

}