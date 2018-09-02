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
      robot: '../../assets/models/robot.json',
    },
    assets: {
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
      pos: [0, -8, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });


    // Load Models
    let robot = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        shadeless : 0,
        diffuse: wgl.assets.robot,
        specular: wgl.assets.robotspec,
        diff_color: [1, 1, 1],
        spec_color: [1.0, 1.0, 1.0],
        ambient : [0.2,0.2,0.2],
        shininess : 256,
      },
      pos: [0, 0, -1.5],
      program: program,
      data: wgl.rawModels.robot
    });
    robot.rotateZ(glMatrix.toRadian(180))

    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction : [0.0, -5.0, -10.0], 
      ambient : [1.0, 1.0, 1.0], 
      diffuse : [1.0, 1.0, 1.0],
      specular : [1.0, 1.0, 1.0],
    });

    let lights = [];
    for (let i = 0; i < 10; i++) {
      let p1 = new WebGL.PointLight(program, i, {
        pos : [0,0,0],
        diffuse : [i/10, i/10, i/10],
        ambient : [0.0,0.0,0.0],
        specular : [1.0,1.0,1.0],
        mesh : WebGL.createSphere({radius : 0.2})
      });
      lights.push(p1);
    }
    

    function animate(time) {
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
  
      robot.render(program);
      // robot.rotateZ(-time/900);

      for (let i = 0; i < lights.length; i++) {
        lights[i].setPosition([
          Math.cos(i + time/1000)*3,
          Math.sin(i + time/1000)*3,
          i-3,
        ]);
        lights[i].render();
      }

      wgl.cam.doMovement(wgl.uView, time)
      requestAnimationFrame(animate);
    }
    animate();
  }

}