
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
      tile: '../../assets/textures/tiles.jpg',
      tilespec: '../../assets/textures/tiles_spec.jpg',
    },
    onDone: onDone
  });


  function onDone() {
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.gl.useProgram(program);
    
    console.log(wgl.gl.getActiveUniform(program, 155))
    wgl.camera({
      pos: [0, -5, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });
    wgl.cam.moveSpeed = 1;
    
    // let loader = new WebGL.Loader(wgl).load('IMAGE', '../../assets/textures/wood.jpg');

    let mat = new WebGL.Material(wgl, {
      useTexture: 1,
      shadeless : 0,
      diffuse: wgl.assets.tile,
      specular: wgl.assets.tilespec,
    })
    let cube = new WebGL.Model(wgl, {
      material : mat,
      pos: [0, 0, 0],
      program: program,
      data: WebGL.createSphere()
    });

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
      mesh : WebGL.createSphere({radius : 0.1})
    });

    const INSTANCES_ROWS = 10;
    const INSTANCES_COLS = 10;
    function animate(time) {
      wgl.background(0.09,0.09,0.09);
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      
      for (let i = 0; i < INSTANCES_ROWS; i++) {
        for (let j = 0; j < INSTANCES_COLS; j++) {
          cube.translate([i*2.0, j*2.0, Math.cos(i+j+time/200)]);
          cube.rotateX(time / 200);
          cube.render();
        }
      }
      p0.setPosition(wgl.cam.position)
      p0.render();
      
      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    
    animate();
    console.log(program);

  }
}