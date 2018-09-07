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
    },
    assets: {
      tile: '../../assets/textures/stronewall.jpg',
      tilespec: '../../assets/textures/stronewall_spec.jpg',
    },
    onDone: onDone
  });

  function onDone() {
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.useShader(program);

    wgl.camera({
      pos: [0, -10, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });


    // Load Models
    let box = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        shadeless: 0,
        ambient: [0.2, 0.2, 0.2],
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
      },
      pos: [-5, 0, 0],
      program: program,
      data: WebGL.createTruncatedCone(0,3,8,10,10)
    });
    box.rotateX(glMatrix.toRadian(-90))
    let cube = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        shadeless: 0,
        ambient: [0.2, 0.2, 0.2],
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
      },
      pos: [5, 0, 0],
      program: program,
      data: WebGL.createTorus(3,1,30,30)
    });

    let dlight = new WebGL.SunLight(program, 0, {
      direction: [0, -5, -10]
    });

    let plight = new WebGL.PointLight(program, 0, {
      pos: [0, -2, 0],
      mesh : WebGL.createSphere({radius : 0.1})
    })


    animate();
    function animate(time) {
      wgl.background();

      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);

      box.render();
      cube.render();

      plight.setPosition([0,10*Math.sin(time/1000),0])
      plight.render();

      wgl.cam.doMovement(wgl.uView, time)
      requestAnimationFrame(animate);
    }
  }
}
