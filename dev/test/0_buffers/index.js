let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
window.onload = function () {

  wgl.init({
    shaders : {
      modular : {
        type : 'URL',
        path : '../../../assets/shaders/',
        vert : 'modular.vs.glsl',
        frag : 'modular.fs.glsl',
      }
    },
    assets: {
      tile: '../../../assets/textures/stronewall.jpg',
      tilespec: '../../../assets/textures/stronewall_spec.jpg',
    },
    onDone: onDone
  });

  function onDone() {
    let gl = wgl.gl;
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.useShader(program);

    wgl.camera({
      pos: [0, -15, 1.0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });
    
    let plane = new WebGL.Model(wgl, {
      material : {
        useTexture : 1,
        shadeless : 0,
        shininess : 64,
        diffuse : wgl.assets.tile,
        specular : wgl.assets.tilespec,
      },
      pos : [0,0,-3],
      data :  WebGL.createPlane({scale : 20.0}),
      program : program,
    });


    let box = new WebGL.Model(wgl, {
      material : {
        useTexture : 1,
        shadeless : 0,
        shininess : 64,
        diffuse : wgl.assets.tile,
        specular : wgl.assets.tilespec,
      },
      pos : [0,0,1],
      data :  WebGL.createBox({scale : 4.0}),
      program : program,
    });

    let dlight = new WebGL.SunLight(program, 0, {
      direction : [5.0, -5.0, -10.0], 
      ambient : [0, 0, 0], 
      diffuse : [1, 1.0, 1.0],
      specular : [1.0, 1.0, 1.0],
    });
    
    let light = new WebGL.PointLight(program, 0, {
      pos : [0,-10,2],
      diffuse : [2.0,0,0],
      intensity : 1.0,
      mesh : WebGL.createSphere({radius : 0.1})
    })

    console.log(program);
    function animate(time) {
      wgl.background();
      
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position);
      wgl.setVariable(program.uniforms.uView, wgl.uView);

      dlight.setDirection([0.1, 0, Math.cos(time/1000)]);

      plane.render();
      box.rotateZ(time / 1000);
      box.render();

      light.setPosition([Math.cos(-time/1000)*10, Math.sin(-time/1000)*10, 2]);
      light.render();
      
      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    animate();
  }

}