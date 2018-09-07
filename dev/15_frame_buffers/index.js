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
    let gl = wgl.gl;
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos: [0, -7, -5],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    console.log(wgl.width, wgl.height);


    let circle = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
      },
      pos: [0, 0, -5],
      data: WebGL.createSphere({segs : 50, rings : 50}),
      program: program
    });
    let plane = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
      },
      pos: [0, 0, -6],
      data: WebGL.createPlane({depth : 0, scale : 15}),
      program: program
    });

    let light = new WebGL.PointLight(program, 0, {
      pos: [0, 0, -3],
      constant : 1.0,
      linear : 0.0075,
      quadratic : 0.035,
      mesh : WebGL.createSphere({radius : 0.1})
    })

    function animate(time) {
      wgl.background();
      
      
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      wgl.setVariable(program.uniforms.uProj, wgl.uProj);
      
      circle.translate([0,10*Math.cos(time/1000),-5]);
      circle.rotateZ(10*Math.cos(time/1000));
      circle.render();
      plane.render();
      light.render();

      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    animate();

  }
}