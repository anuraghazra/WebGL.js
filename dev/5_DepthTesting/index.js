window.onload = function () {
  let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);


  wgl.init({
    shaders: {
      simple: {
        type: 'URL',
        path : '../../assets/shaders/',
        vert: 'modular.vs.glsl',
        frag: 'modular.fs.glsl',
      },
    },
    rawModels : {
      home: '../../assets/models/teapot.json',
    },
    assets: {
      tex: '../../assets/textures/iron-rusted4-basecolor.png',
    },
    onDone: load
  })

  function load() {
    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);

    wgl.gl.useProgram(program);

    wgl.camera({
      pos : [0, -8, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    

    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction : [0.0, -5.0, -10.0], 
      ambient : [1.0, 1.0, 1.0], 
      diffuse : [1.0, 1.0, 1.0],
      specular : [1.0, 1.0, 1.0],
    });
    
    let model = new WebGL.Model(wgl, {
      material: {
        useTexture: 0,
        shadeless : 0,
        diff_color: [1.0, 1.0, 1.0],
        spec_color: [1.0, 1.0, 1.0],
        ambient : [0.2,0.2,0.2],
        shininess : 128,
      },
      pos: [0, 0, -1.5],
      program: program,
      data: wgl.rawModels.home
    });
    
 

    function animate(time) {
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.camera.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
  
      model.render(program);

      wgl.camera.doMovement(wgl.uView, time);

      requestAnimationFrame(animate);
    }
    animate();
  }

}