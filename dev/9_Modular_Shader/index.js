
window.onload = function () {
  let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);

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
      teapot: '../../assets/models/teapot.json',
      robot: '../../assets/models/robot.json',
    },
    assets: {
      teapot: '../../assets/textures/tiles.jpg',
      teapotspec: '../../assets/textures/tiles_spec.jpg',
      robot: '../../assets/textures/robot.jpg',
      robotspec: '../../assets/textures/robot_spec.jpg',
    },
    onDone: onDone
  });


  function onDone() {
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos: [0, -20, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    // Load Models
    let teapot = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        shadeless : 0,
        diffuse: wgl.assets.teapot,
        specular: wgl.assets.teapotspec,
        diff_color: [1.0, 1.0, 1.0],
        spec_color: [1.0, 1.0, 1.0],
      },
      pos: [0, 0, 0],
      program: program,
      data: wgl.rawModels.teapot
    });

    let robot = new WebGL.Model(wgl, {
      material : {
        useTexture: 1,
        shadeless : 0,
        diffuse: wgl.assets.robot,
        specular: wgl.assets.robotspec,
      },
      pos: [-5, 0, 0],
      program: program,
      data: wgl.rawModels.robot
    });
    robot.rotateZ(glMatrix.toRadian(-180));


    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction : [0.0, -5.0, -10.0], 
      ambient : [0.05, 0.05, 0.05], 
      diffuse : [0.5, 0.5, 0.5],
      specular : [1.0, 1.0, 1.0],
    });

    let lamp = WebGL.createSphere({radius : 0.2, segs : 16, rings : 16});

    let p0 = new WebGL.PointLight(program, 0, {
      pos : [-4.0, -2.0, 2.0],
      ambient : [0, 0, 0],
      diffuse : [1.0, 0.0, 1.0],
      specular :  [1.0, 0.0, 0.0],
      linear : 0.045,
      quadratic : 0.0075,
      mesh : lamp
    });
    
    let p1 = new WebGL.PointLight(program, 1, {
      pos : [5.0, -5.0, 2.0],
      ambient : [0, 0, 0],
      diffuse : [0.0, 1.0, 0.0],
      specular :  [1.0, 1.0, 1.0],
      linear : 0.045,
      quadratic : 0.0075,
      mesh : lamp
    });
    
    let p2 = new WebGL.PointLight(program, 2, {
      pos : [5, -2.0, 2.0],
      ambient : [0, 0, 0],
      diffuse : [2.0, 2.0, 2.0],
      mesh : lamp
    });

    let objpositions = [
      [0, 0, 0],
      [6, 0, 0],
      [12, 0, 0],
      [18, 0, 0],
      [-6, 0, 0],
      [-12, 0, 0],
      [-18, 0, 0],
    ];

    function animate(time) {
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.camera.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      
      p2.setPosition([Math.cos(0.5*time/1000)*20, -4, 2]);
      p1.setPosition([Math.cos(time/1000)*20, -5+Math.sin(time/1000)*10, -4]);

      p2.render();
      p1.render();
      p0.render();

      
      for (let i = 0; i < objpositions.length; i++) {
        robot.translate(objpositions[i]);
        robot.rotateZ(time/1000);
        robot.render(program);
      }
      for (let i = 0; i < objpositions.length; i++) {
        teapot.translate([objpositions[i][0], -5, -5 ]);
        teapot.rotateZ(-time/1000);
        teapot.render(program);
      }
      
      wgl.camera.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    
    animate();
    console.log(program);

  }
}