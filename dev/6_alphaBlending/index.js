let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
window.onload = function () {


  wgl.init({
    shaders: {
      simple: {
        type: 'URL',
        path : './',
        vert: 'alpha.vs.glsl',
        frag: 'alpha.fs.glsl',
      },
    },
    assets : {
      mmtex : '../../assets/textures/semi_transparent.png',
      mmtex2 : '../../assets/textures/stronewall.jpg',
    },
    models: {
      suzane: {
        mesh: '../../assets/models/circle.json',
        tex: '../../assets/textures/semi_transparent.png',
      },
    },
    onDone: load
  })
  
  function load() {
    let gl = wgl.gl;
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);
    wgl.gl.useProgram(program);
    
    wgl.camera({
      pos : [0, -5, 0],
      world: program.uniforms.mWorld,
      view: program.uniforms.mView,
      proj: program.uniforms.mProj,
    });
    
    let box = new WebGL.BoxMesh(wgl, {
      pos : [0,0,0],
      size : 1.0,
      scale : 1.0,
      tex : wgl.assets.mmtex
    });
    wgl.addMesh(box);
    
    wgl.setStructVariables(program.uniforms, 'light', {
      dir : [-9.0,9.0,9.0],
      sun : [1.0,1.0,1.0],
      ambient : [1.0,1.0,1.0]
    });


    
    wgl.enableAlphaBlend();
    function animate(time) {
      wgl.background();
      
      box.rotateX(time / 1000);
      box.rotateY(time / 500);
      box.rotateZ(time / 500);
      
      
      wgl.setVariable(program.uniforms.mView, wgl.mView);
      wgl.renderMeshes(program, ['position', 'vertNorm', 'aTexCoord'], 0);

      
      wgl.camera.doMovement(wgl.mView, time);
      requestAnimationFrame(animate);
    }
    animate();
  }

}