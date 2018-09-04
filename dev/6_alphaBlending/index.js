let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);
window.onload = function () {


  wgl.init({
    shaders: {
      alpha: {
        type: 'URL',
        path: './',
        vert: 'alpha.vs.glsl',
        frag: 'alpha.fs.glsl',
      },
    },
    assets: {
      mmtex: '../../assets/textures/semi_transparent.png',
      mmtex2: '../../assets/textures/stronewall.jpg',
    },
    onDone: load
  })

  function load() {
    let gl = wgl.gl;
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.alpha.vert, wgl.shaders.alpha.frag);
    wgl.gl.useProgram(program);

    wgl.camera({
      pos: [0, -5, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });


    let box = new WebGL.Model(wgl, {
      // material : {
      //   shadeless : 0
      // },
      pos: [0, 0, 0],
      program: program,
      data: WebGL.createBox({})
    });


    let tex = wgl.setupTexture(wgl.assets.mmtex2);
    
    console.log(program)
    wgl.enableAlphaBlend();
    
    
    function animate(time) {
      wgl.background();
      
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      
      
      //cleanup
      wgl.useTexture(tex, program.uniforms.tex, 0);
      box.render();


      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    animate();
  }

}