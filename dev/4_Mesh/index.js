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
    rawModels : {
      model : '../../assets/models/teapot.json',
    },
    assets: {
      diff: '../../assets/textures/tiles.jpg',
      spec: '../../assets/textures/tiles_spec.jpg',
    },
    onDone: load
  });

  function load() {

    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);
    wgl.gl.useProgram(program);
    console.log(program)

    wgl.camera({
      fov: 65,
      near: 0.1,
      far: 1000,
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });
    wgl.cameraPosition(0, -7, 0);


    let model = new WebGL.Model(wgl, {
      material : {
        useTexture : 1,
        diffuse : wgl.assets.diff,
        specular : wgl.assets.spec
      },
      pos: [0, 0, -1.5],
      data : wgl.rawModels.model,
      program : program,
    });

    
    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction: [-0.2, -1.0, -0.3],
      ambient: [0.5, 0.5, 0.5],
      diffuse: [1.0, 1.0, 1.0],
      specular: [1.0, 1.0, 1.0],
    });

    function animate(time) {
      wgl.background(0.1, 0.1, 0.1);


      wgl.setVariable(program.uniforms.uView, wgl.uView);
      wgl.setVariable(program.uniforms.uEyeView, wgl.camera.position);
      
      model.render(program);


      wgl.camera.doMovement(wgl.uView, time);

      requestAnimationFrame(animate);
    }
    animate();
  }

}