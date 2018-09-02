window.onload = function () {
  let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);

  wgl.init({
    shaders: {
      simple: {
        type: 'URL',
        path: '../../assets/shaders/',
        vert: 'modular.vs.glsl',
        frag: 'modular.fs.glsl',
      },
    },
    // models: {
    //   suzane: {
    //     mesh: '../../assets/models/teapot.json',
    //     tex: true,
    //   },
    //   l: {
    //     mesh: '../../assets/models/circle.json',
    //     tex: true,
    //   },
    // },
    rawModels : {
      suzane: '../../assets/models/teapot.json',
      lamp: '../../assets/models/circle.json',
    },
    assets: {
      diff: '../../assets/textures/tiles.jpg',
      spec: '../../assets/textures/tiles_spec.jpg',
    },
    onDone: load
  })

  function load() {

    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos : [0,-8,0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    console.log(program)

    let cubePositions = [
      [-5.0, 0.0, 0.0],
      [5.0, -2.0, -0.0],
      [0.0, 10.2, -0.5],
      [3.8, -2.0, 5.3],
      [5.4, 5.4, -3.5],
      [6.7, -5.0, -1.5],
      [1.3, -2.0, -2.5],
    ]
    
    let teapot = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        diffuse: wgl.assets.diff,
        specular: wgl.assets.spec,
        color: [0.0, 1.0, 1.0],
      },
      pos: [0, 0, 0],
      program: program,
      data: wgl.rawModels.suzane
    });
    
    let p0 = new WebGL.PointLight(program, 0, {
      pos : [4.0, 5.0, 0.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [0.0, 5.0, 0.0],
      specular :  [1.0, 1.0, 1.0],
      constant : 1.0,
      linear : 0.035,
      quadratic : 0.044,
      mesh : wgl.rawModels.lamp,
    });
    
    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction: [-0.2, -1.0, -0.3],
      ambient: [0.2, 0.2, 0.2],
      diffuse: [1.0, 1.0, 1.0],
      specular: [1.0, 1.0, 1.0],
    });

    function animate(time) {
      wgl.background(0.1, 0.1, 0.1);

      let lightpositions = [
        [0.0, -0.0, 6.0],
        [0.0, -5.0, -2.0],
        [-0, -1.0, 0.0],
        [5, -3.0, 2.0]
      ]
      lightpositions[0][2] = 8*Math.cos(time / 500);
      lightpositions[1][1] = 8*Math.sin(time / 500);
      lightpositions[2][1] = 12*Math.cos(time / 500);
      lightpositions[3][0] = 12*Math.cos(time / 500);


      // PointLight(0, {
      //   pos: lightpositions[0],
      //   ambient: [0.5, 0.5, 0.5],
      //   diffuse: [0.0, 1.0, 0.0],
      //   specular: [1.0, 1.0, 1.0],
      //   constant: 1.0,
      //   linear: 0.035,
      //   quadratic: 0.044,
      // })
      // PointLight(1, {
      //   pos: lightpositions[1],
      //   ambient: [0.5, 0.5, 0.5],
      //   diffuse: [0.0, 1.0, 0.5],
      //   specular: [1.0, 1.0, 1.0],
      //   constant: 1.0,
      //   linear: 0.01,
      //   quadratic: 0.044,
      // });
      // PointLight(2, {
      //   pos: lightpositions[2],
      //   ambient: [0.5, 0.5, 0.5],
      //   diffuse: [1.0, 0.0, 1.0],
      //   specular: [1.0, 1.0, 1.0],
      //   constant: 1.0,
      //   linear: 0.035,
      //   quadratic: 0.044,
      // });
      // PointLight(3, {
      //   pos: lightpositions[3],
      //   ambient: [0.5, 0.5, 0.5],
      //   diffuse: [0.0, 1.0, 1.0],
      //   specular: [1.0, 1.0, 1.0],
      //   constant: 1.0,
      //   linear: 0.035,
      //   quadratic: 0.044,
      // });


      wgl.setVariable(program.uniforms.uView, wgl.uView);
      wgl.setVariable(program.uniforms.uEyeView, wgl.camera.position);

      for (let j = 0; j < cubePositions.length; j++) {
        teapot.translate(cubePositions[j]);
        teapot.render(program);
      }
      //cleanup
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);

      
      wgl.renderMeshes(program);

      wgl.camera.doMovement(wgl.uView, time);

      requestAnimationFrame(animate);
    }
    animate();
  }

}