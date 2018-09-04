window.onload = function () {
  let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);

  wgl.init({
    shaders: {
      simple: {
        type: 'URL',
        path: '../../assets/shaders/',
        vert: 'material.vs.glsl',
        frag: 'material.fs.glsl',
      },
    },
    rawModels: {
      suzane : '../../assets/models/teapot.json',
      home : '../../assets/models/robot.json',
    },
    assets : {
      diff: '../../assets/textures/tiles.jpg',
      spec : '../../assets/textures/tiles_spec.jpg',
      robot : '../../assets/textures/stronewall.jpg',
      robotspec : '../../assets/textures/stronewall_spec.jpg',
    },
    onDone: load
  })

  function load() {

    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);
    wgl.gl.useProgram(program);
    console.log(program)

    wgl.camera({
      pos : [0, -8, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    console.log(program)

    
    let model = new WebGL.Model(wgl, {
      material : {
        useTexture: 1,
        textures: {
          diffuse: wgl.assets.diff,
          specular: wgl.assets.spec,
        },
        color: [0.0, 1.0, 0.0],
      },
      program : program,
      data : wgl.rawModels.suzane,
      pos : [0.0,0.0,-1.0],
    })
    // wgl.addMesh(model);
    let model2 = new WebGL.Model(wgl, {
      material : {
        useTexture: 1,
        textures: {
          diffuse: wgl.assets.tile,
          specular: wgl.assets.robotspec,
        },
        color: [0.0, 1.0, 0.0],
      },
      program : program,
      data : wgl.rawModels.suzane,
      pos : [5.0,0.0,-1.0],
    })
    // wgl.addMesh(model2);


    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction : [-0.2, -1.0, -0.3], 
      position : [0.0, -0.4, 0.0], 
      ambient : [0.5, 0.5, 0.5], 
      diffuse : [0.5, 0.0, 0.0], 
      specular : [1.0, 1.0, 1.0],
    });

    function PointLight(index, data) {
      var pl_pos = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].position');
      var pl_diff = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].diffuse');
      var pl_ambi = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].ambient');
      var pl_spec = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].specular');
      var pl_cons = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].constant');
      var pl_line = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].linear');
      var pl_quad = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].quadratic');
      wgl.setVariable(pl_pos, data.pos);
      wgl.setVariable(pl_ambi, data.ambient);
      wgl.setVariable(pl_diff, data.diffuse);
      wgl.setVariable(pl_spec, data.specular);
      wgl.setVariable(pl_cons, data.constant);
      wgl.setVariable(pl_line, data.linear);
      wgl.setVariable(pl_quad, data.quadratic);
    }
    PointLight(0, {
      pos : [0.0, -0.0, 6.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [0.0, 1.0, 0.0],
      specular :  [1.0, 1.0, 1.0],
      constant : 1.0,
      linear : 0.035,
      quadratic : 0.044,
    });
    PointLight(1, {
      pos : [0.0, -5.0, -5.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [0.0, 0.0, 0.5],
      specular :  [1.0, 1.0, 1.0],
      constant : 1.0,
      linear : 0.035,
      quadratic : 0.044,
    });
    PointLight(2, {
      pos : [-5, -3.0, 0.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [5.0, 0.0, 1.0],
      specular :  [1.0, 1.0, 1.0],
      constant : 1.0,
      linear : 0.035,
      quadratic : 0.044,
    });
    PointLight(3, {
      pos : [5, -3.0, 0.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [0.0, 1.0, 1.0],
      specular :  [1.0, 1.0, 1.0],
      constant : 1.0,
      linear : 0.035,
      quadratic : 0.044,
    });


    function animate(time) {
      wgl.background(0.1,0.1,0.1);
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      wgl.setVariable(program.uniforms.cameraPos, wgl.cam.position);

      model.rotateZ(time / 1000);

      model2.render();
      
      wgl.cam.doMovement(wgl.uView, time);

      requestAnimationFrame(animate);
    }
    animate();
  }

}