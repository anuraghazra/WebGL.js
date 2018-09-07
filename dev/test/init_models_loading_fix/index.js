
let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
window.onload = function () {

  wgl.init({
    shaders: {
      modular: {
        type: 'URL',
        path: '../../../assets/shaders/',
        vert: 'modular.vs.glsl',
        frag: 'modular.fs.glsl',
      },
    },
    rawModels : {
      cube : '../../../assets/models/box.json',
      robot : '../../../assets/models/robot.json',
    },
    assets: {
      tile: '../../../assets/textures/tiles.jpg',
      tilespec: '../../../assets/textures/tiles_spec.jpg',
    },
    onDone: onDone
  });


  function onDone() {
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.gl.useProgram(program);
    
    console.log(wgl.models);

    wgl.camera({
      pos: [0, -5, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    let mat = new WebGL.Material(wgl, {
      useTexture : 1,
      diffuse : wgl.assets.tile,
      specular : wgl.assets.tilespec,
    })

    let dlight = new WebGL.SunLight(program, 0, {
      direction : [0, -5, -5.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [1.0, 1.0, 1.0],
      specular :  [1.0, 1.0, 1.0],
      linear : 0.045,
      quadratic : 0.0075,
    });
    let p0 = new WebGL.PointLight(program, 0, {
      pos : [-4.0, -2.0, 2.0],
      ambient : [0.0, 0.0, 0.0],
      diffuse : [1.0, 0.0, 0.0],
      specular :  [1.0, 1.0, 1.0],
      // mesh : WebGL.createSphere({radius : 0.1})
    });

    let cube = new WebGL.Model(wgl, {
      material : {
        shadeless : 0
      },
      data : wgl.rawModels.cube,
      program : program
    })
    let robot = new WebGL.Model(wgl, {
      material : {
        useTexture : 1,
        diffuse : wgl.assets.tile,
        specular : wgl.assets.tilespec,
        shadeless : 0
      },
      data : wgl.rawModels.robot,
      program : program
    })
    function animate(time) {
      wgl.background();

      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      
      cube.render();
      robot.render();
      p0.setPosition(wgl.cam.position)
      // p0.render();
      
      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    
    animate();
    console.log(program);

  }
}