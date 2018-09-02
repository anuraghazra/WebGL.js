let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
window.onload = function () {

  wgl.init({
    shaders: {
      simple: {
        type: 'URL',
        path : '../../assets/shaders/',
        vert: 'simple.vs.glsl',
        frag: 'simple.fs.glsl',
      },
    },
    assets : {
      texture : '../../assets/textures/tiles.jpg',
      texture1 : '/tests/meshLoading/fire_Extingwisher_UVs Textured.jpg'
    },
    rawModels : {
      suzane: '/tests/meshLoading/suzane.json',
      fire: '/tests/meshLoading/fire_Extingwisher.json',
    },
    onDone: load
  })

  function load() {
    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos : [0.0,-8.0, 0.0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    console.log(program)
    let mybox = new WebGL.Model(wgl, {
      data : wgl.rawModels.suzane,
      tex : wgl.assets.texture,
      pos : [1.0,-2.0,1.0],
    });
    let mybox2 = new WebGL.Model(wgl, {
      data : wgl.rawModels.fire, 
      tex : wgl.assets.texture1,
      pos : [5.0,-0.0,-3.0] 
    });
    wgl.addMesh(mybox);
    wgl.addMesh(mybox2);
    
    wgl.setStructVariables(program.uniforms, 'light', {
      ambient : [0.5,0.5,0.5],
      sun : [1.0,1.0,1.0],
      dir : [1.0,1.0,1.0],
    })

    function animate(time) {
      wgl.background();
      
      mybox2.rotateZ(glMatrix.toRadian(time / 20))
      mybox.rotateZ(glMatrix.toRadian(time / 20))

      wgl.setVariable(program.uniforms.uView, wgl.uView);

      wgl.renderMeshes(program, ['aPosition', 'aNormal', 'aTexCoord'], 0)
      // mybox.render(program, ['aPosition', 'aNormal', 'aTexCoord'], 0);
      // mybox2.render(program, ['aPosition', 'aNormal', 'aTexCoord'], 0);

      wgl.camera.doMovement(wgl.uView, time);

      requestAnimationFrame(animate);
    }
    animate();
  }

}