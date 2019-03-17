let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
let CANVAS_WIDTH = wgl.canvas.width;
let CANVAS_HEIGHT = wgl.canvas.height;
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
      tile: '../../assets/textures/tiles.jpg',
      tilespec: '../../assets/textures/tiles_spec.jpg',
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
    let pmat = new WebGL.Material(wgl, {
      useTexture: 1,
      shadeless : 0,
      diffuse: wgl.assets.tile,
      specular: wgl.assets.tilespec,
    });

    let particles = [];

    for (let i = 0; i < 100; i++) {
      let p = new Particle(0, 0, 0, pmat, program)
      particles.push(p);
    }
    
    let dlight = new WebGL.SunLight(program, 0, {
      direction : [0, -5, -5.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [1.0, 1.0, 1.0],
      specular :  [1.0, 1.0, 1.0],
      linear : 0.045,
      quadratic : 0.0075,
    });

    animate();
    function animate(time) {
      wgl.background();

      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].render();
      }

      wgl.cam.doMovement(wgl.uView, time)
      requestAnimationFrame(animate);
    }
  }
}
