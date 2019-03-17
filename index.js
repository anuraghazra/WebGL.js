let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);

wgl.init({
  shaders: {
    modular: {
      type: 'URL',
      path: './assets/shaders/',
      vert: 'modular.vs.glsl',
      frag: 'modular.fs.glsl',
    },
  },
  rawModels: {
    teapot: './assets/models/teapot.json',
  },
  assets: {
    teapot: '../../assets/textures/tiles.jpg',
    teapotspec: '../../assets/textures/tiles_spec.jpg',
  },
  onDone: load
})

function load() {
  wgl.enable3DDepth();
  // let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
  let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
  wgl.useShader(program);

  wgl.camera({
    pos: [0, -20, 0],
    world: program.uniforms.uWorld,
    view: program.uniforms.uView,
    proj: program.uniforms.uProj,
  });

  console.log(program);

  // Load Models
  let teapot = new WebGL.Model(wgl, {
    material: {
      useTexture: 1,
      shadeless: 0,
      diffuse: wgl.assets.teapot,
      specular: wgl.assets.teapotspec,
      diff_color: [1.0, 1.0, 1.0],
      spec_color: [1.0, 1.0, 1.0],
    },
    pos: [0, 0, 0],
    program: program,
    data: wgl.rawModels.teapot
  });

  let dlight = new WebGL.SunLight(program, 0, {
    direction: [0, -5, -10],
    ambient: [1.0, 1.0, 1.0],
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
  });

  let plight = new WebGL.PointLight(program, 0, {
    pos: [0, -2, 0],
    mesh: WebGL.createSphere({ radius: 0.1 })
  })


  function animate(time) {
    wgl.background();
    wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
    wgl.setVariable(program.uniforms.uView, wgl.uView);

    plight.setPosition([-5, Math.cos(0.5 * time / 1000) * 5, 0]);
    plight.render();

    teapot.render();

    wgl.cam.doMovement(wgl.uView, time);
    requestAnimationFrame(animate);
  }
  animate();
}
