
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
    console.log(wgl.shaders)

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

    let plane = new WebGL.Model(wgl, {
      material : {
        useTexture: 1,
        shadeless : 0,
        diffuse: wgl.assets.teapot,
        texture_settings : {
          WRAP_S : wgl.gl.REPEAT,
          WRAP_T : wgl.gl.REPEAT,
        },
        specular: wgl.assets.teapotspec,
      },
      pos: [0, 0, -5],
      program: program,
      data: WebGL.createPlane({ scale : 40, depth : 0.1, uvSize : 5 })
    });

    // let dlight = new WebGL.SunLight(program, 0, {
    //   direction : [0, -10, -30.0],
    //   ambient : [0.05, 0.05, 0.05],
    //   diffuse : [1, 1, 1],
    //   specular : [1.0, 1.0, 1.0],
    // });

    let lamp = new WebGL.Model(wgl, {
      pos: [0, 0, 0],
      program: program,
      data: WebGL.createSphere({radius : 0.1})
    });
    
    let p0 = new WebGL.PointLight(program, 0, {
      pos : [-4.0, -2.0, 2.0],
      ambient : [0, 0, 0],
      diffuse : [1.0, 0.0, 1.0],
      specular :  [1.0, 0.0, 0.0],
      mesh : lamp
    });

    let spot = new WebGL.SpotLight(program, 0, {
      position : [0.0, -5.0, 0.0],
      direction : [0, 90, -60],
      ambient : [0.1, 0.1, 0.1],
      diffuse : [1, 1.0, 1.0],
      specular :  [1.0, 1.0, 1.0],
      cutOff : Math.cos(glMatrix.toRadian(30)),
      outerCutOff : Math.cos(glMatrix.toRadian(20)),
      mesh : WebGL.createTruncatedCone(0,0.3,1,10,10)
    });

    const INSTANCES = 5;
    function animate(time) {
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      
      p0.setPosition([Math.cos(0.5*time/1000)*20, -4, 2]);
      p0.render();

      spot.setPosition(wgl.cam.position);
      spot.setDirection(wgl.cam.forward);
      
      for (let i = 0; i < INSTANCES; i++) {
        robot.translate([(i * 5) - INSTANCES*2, 0, -3.5]);
        robot.rotateZ(time / 1000);
        robot.render();
      }
      for (let i = 0; i < INSTANCES; i++) {
        teapot.translate([(i * 5) - INSTANCES*2, -5, -5]);
        teapot.rotateZ(-time / 1000);
        teapot.render();
      }
      plane.render();
      
      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    
    animate();
    console.log(program);

  }
}