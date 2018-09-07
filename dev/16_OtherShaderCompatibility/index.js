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

    let program = wgl.createProgram(WebGL.Shaders.AmbientLight.vs, WebGL.Shaders.AmbientLight.fs);
    wgl.gl.useProgram(program);
    console.log(program);

    wgl.camera({
      pos: [0, -10, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });


    // Load Models
    // let mat = new WebGL.Material(wgl, {
    //   useTexture: 1,
    //   shadeless: 0,
    //   ambient: [0.2, 0.2, 0.2],
    //   // diffuse: wgl.assets.tile,
    //   // specular: wgl.assets.tilespec,
    // })
    let cone = new WebGL.Model(wgl, {
      // material: mat,
      pos: [-5, 0, 0],
      program: program,
      data: WebGL.createTruncatedCone(0, 3, 8, 10, 10)
    });

    let torus = new WebGL.Model(wgl, {
      // material: mat,
      pos: [5, 0, 0],
      program: program,
      data: WebGL.createTorus(3, 1, 30, 30)
    });



    wgl.setStructVariables(program.uniforms, 'light', {
      ambient: [0.5, 0.5, 0.5],
      diff_color: [1, 1, 1],
      direction: [0, 0, 2],
    })

    // let dlight = new WebGL.SunLight(program, 0, {
    //   direction: [0, -5, -10]
    // });

    // let plight = new WebGL.PointLight(program, 0, {
    //   pos: [0, -2, 0],
    //   mesh : WebGL.createSphere({radius : 0.1})
    // })


    let tex = wgl.setupTexture(wgl.assets.tile);
    animate();
    function animate(time) {
      wgl.background();

      // wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);

      wgl.useTexture(tex, program.uniforms.uSampler, 0);
      cone.render();
      // wgl.useTexture(tex2, program.uniforms.uSampler, 0);
      torus.render();

      // plight.setPosition([0,10*Math.sin(time/1000),0])
      // plight.render();

      wgl.cam.doMovement(wgl.uView, time)
      requestAnimationFrame(animate);
    }
  }
}
