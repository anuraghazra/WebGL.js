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
      plane: '../../assets/models/plane.json',
      // robot: '../../assets/models/robot.json',
    },
    assets: {
      robot: '../../assets/textures/robot.jpg',
      robotspec: '../../assets/textures/robot_spec.jpg',
      tile: '../../assets/textures/stronewall.jpg',
      tilespec: '../../assets/textures/stronewall_spec.jpg',
    },
    onDone: onDone
  });

  function onDone() {
    wgl.enable3DDepth();


    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos: [0, -7, -0.5],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });


    // Load Models
    let robot = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        // useBlinnShading : 0,
        ambient: [0.2, 0.2, 0.2],
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
        specularIntensity: 1.0,
        shininess: 16
      },
      pos: [0, 0, -1.5],
      program: program,
      data: wgl.rawModels.plane
    });

    // wgl.setStructVariables(program.uniforms, 'dirlight', {
    //   direction : [0.0, -5.0, -10.0], 
    //   ambient : [0.5, 0.5, 0.5], 
    //   diffuse : [1, 1, 1],
    //   specular : [1.0, 1.0, 1.0],
    // });

    // let lamp = new WebGL.Model(wgl, {
    //   program: program,
    //   data: WebGL.createSphere({ radius: 0.1 })
    // })
    let light = new WebGL.PointLight(program, 0, {
      pos: [-2, -0, 1.0],
      ambient: [1.0, 1.0, 1.0],
      diffuse: [1.0, 1.0, 1.0],
      specular: [1.0, 1.0, 1.0],
      constant: 0.5,
      linear: -0.015,
      quadratic: 0.0075,
      // mesh: lamp
    });
    let light2 = new WebGL.PointLight(program, 1, {
      pos: [-2, -0, 1.0],
      ambient: [1.0, 1.0, 1.0],
      diffuse: [1.0, 0.0, 0.0],
      specular: [1.0, 1.0, 1.0],
      constant: 1,
      linear: -0.015,
      quadratic: 0.0075,
      // mesh: lamp
    });


    // let frame = wgl.gl.createFramebuffer();
    // wgl.gl.bindFramebuffer(wgl.gl.FRAMEBUFFER, frame);
    // wgl.gl.viewport(0, 0, wgl.canvas.width, wgl.canvas.height);
    // if (wgl.gl.checkFramebufferStatus(wgl.gl.FRAMEBUFFER) === wgl.gl.FRAMEBUFFER_COMPLETE) {
    //   console.log('ok')
    // }
    
    console.log(program)
    animate();
    function animate(time) {
      
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);

      robot.render();

      light.setPosition([-2, -0, 5 + Math.cos(0.9 * time / 1000) * 5])
      // light.render();
      light2.setPosition([5, -0, 5 + Math.cos(0.9 * time / 1000) * 5])
      // light2.render();


      wgl.cam.doMovement(wgl.uView, time)
      requestAnimationFrame(animate);
    }
    // animate();
  }

}