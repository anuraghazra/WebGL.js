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
    let program2 = wgl.createProgram(WebGL.Shaders.Simple.vs, WebGL.Shaders.Simple.fs);

    // Load Models
    let mat3 = new WebGL.Material(wgl, {
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
    });

    let robotInstance = new WebGL.Model(wgl, {
      material : mat3,
      pos: [2, 0, -1.5],
      program: program,
      data: wgl.rawModels.robot
    });

    // let robot1 = new WebGL.Model(wgl, {
    //   material : mat3,
    //   pos: [2, 0, -1.5],
    //   program: program,
    //   data: wgl.rawModels.robot,
    // });

    let robot1 = new WebGL.Model(wgl, {
      material : mat3,
      pos: [2, 0, -1.5],
      program: program,
      data: robotInstance,
    });
    robot1.rotateZ(glMatrix.toRadian(180));
    
    let robot2 = new WebGL.Model(wgl, {
      material : mat3,
      pos: [-2, 0, -1.5],
      program: program2,
      data: robotInstance,
    });
    robot2.rotateZ(glMatrix.toRadian(180));

    
    // lamp
    let lampmesh = new WebGL.Model(wgl, {
      pos: [2, 0, -1.5],
      program: program,
      data: WebGL.createSphere({radius : 0.1}),
    });
    let light = new WebGL.PointLight(program, 0, {
      pos : [-1,-1,2],
      diffuse : [1.0, 1.0, 1.0],
      ambient : [0.0,0.0,0],
      specular : [1.0,1.0,1.0],
      mesh : lampmesh
    });
    
    wgl.camera({
      pos: [0, -4, 2],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    wgl.setStructVariables(program.uniforms, 'dirlight', {
      direction : [0.0, -5.0, -10.0], 
      ambient : [0.2, 0.2, 0.2], 
      diffuse : [1.0, 1.0, 1.0],
      specular : [5.0, 5.0, 5.0],
    });
    console.log(program)

    function animate(time) {
      wgl.background();

      // use program
      wgl.useShader(program);
      wgl.setMVP({
        world: program.uniforms.uWorld,
        view: program.uniforms.uView,
        proj: program.uniforms.uProj,
      })
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      
      // use program2
      // wgl.useShader(program2);
      // wgl.setMVP({
      //   world: program2.uniforms.uWorld,
      //   view: program2.uniforms.uView,
      //   proj: program2.uniforms.uProj,
      // })
      // wgl.setVariable(program2.uniforms.uView, wgl.uView);
      
      // the render method uses `useProgram(currentProgram)`
      // then at last unbind the program
      robot1.render();      
      robot2.render();

      light.render();
      
      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    animate();
  }

}