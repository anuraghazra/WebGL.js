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
    rawModels: {
      plane: '../../assets/models/plane.json',
    },
    assets: {
      tile: '../../assets/textures/stronewall.jpg',
      tilespec: '../../assets/textures/stronewall_spec.jpg',
    },
    onDone: onDone
  });

  function onDone() {
    let gl = wgl.gl;
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos: [0, -7, -0.5],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });


    let model = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        // ambient: [0.2, 0.2, 0.2],
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
        // specularIntensity: 1.0,
        // shininess: 16
      },
      data: wgl.rawModels.plane,
      program: program
    });

    let light = new WebGL.PointLight(program, 0, {

    })

    function animate(time) {
      wgl.background();

      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      wgl.setVariable(program.uniforms.uProj, wgl.uProj);

      // model.material.setTexture(program, wgl.assets.tiles, wgl.assets.tiles)
      model.render();


      wgl.cam.doMovement(wgl.uView, time)
      requestAnimationFrame(animate);
    }
    animate();

  }
}