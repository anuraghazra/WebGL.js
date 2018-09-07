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
    wgl.useShader(program);

    console.log(program)

    wgl.camera({
      pos: [0, -4, 2],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });


    // Load Models
    let robot = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        useBlinnShading : 1,
        shadeless : 0,
        diffuse: wgl.assets.robot,
        specular: wgl.assets.robotspec,
        diff_color: [1, 1, 1],
        spec_color: [1.0, 1.0, 1.0],
        ambient : [0.1,0.1,0.1],
        specularIntensity : 1.0,
        shininess : 128.0,
      },
      pos: [0, 0, -1.5],
      program: program,
      data: wgl.rawModels.robot
    });
    console.log(robot);
    robot.rotateZ(glMatrix.toRadian(180))

    
    let dlight = new WebGL.SunLight(program, 0, {
      direction : [0.0, -5.0, -10.0], 
      ambient : [0.2, 0.2, 0.2], 
      diffuse : [1.0, 1.0, 1.0],
      specular : [5.0, 5.0, 5.0],
    });
    let light = new WebGL.PointLight(program, 0, {
      pos : [-1,-1,2],
      diffuse : [1.0, 1.0, 1.0],
      ambient : [0.0,0.0,0],
      specular : [1.0,1.0,1.0],
      mesh : WebGL.createSphere({radius : 0.1})
    });
    
    

    function animate(time) {
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
  
      robot.render();

      light.render();

      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    animate();
  }

}