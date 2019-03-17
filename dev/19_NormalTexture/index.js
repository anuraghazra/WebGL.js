
let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
window.onload = function () {

  wgl.init({
    shaders: {
      simple: {
        type: 'STRING',
        // path: '../../assets/shaders/',
        vert: WebGL.Shaders.AmbientLight.vs,
        frag: WebGL.Shaders.AmbientLight.fs
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
    console.log(wgl.shaders)

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos: [0, -20, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    // Load Models

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

    let dlight = new WebGL.SunLight(program, 0, {
      direction : [0, -10, -30.0],
      ambient : [0.05, 0.05, 0.05],
      diffuse : [1, 1, 1],
      specular : [1.0, 1.0, 1.0],
    });


    const INSTANCES = 5;
    function animate(time) {
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);

      
      for (let i = 0; i < INSTANCES; i++) {
        robot.translate([(i * 5) - INSTANCES*2, 0, -3.5]);
        robot.rotateZ(time / 1000);
        robot.render();
      }
      
      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    
    animate();

  }
}