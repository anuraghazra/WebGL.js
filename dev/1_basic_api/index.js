window.onload = function () {
  let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);


  wgl.init({
    shaders: {
      simple: {
        type: 'DOM',
        path : '../../assets/shaders/',
        vert: '#vert',
        frag: '#frag',
      },
    },
    models: {
      suzane: {
        mesh: '/meshLoading/suzane.json',
        tex: '/meshLoading/suzane.png',
      }
    },
    onDone: load
  })

  function load() {
    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);

    wgl.gl.useProgram(program);

    wgl.camera({
      fov: 65,
      near: 0.1,
      far: 1000,
      world: program.uniforms.mWorld,
      view: program.uniforms.mView,
      proj: program.uniforms.mProj,
    });
    wgl.cameraPosition(0, -8, 0);

    console.log(program)


    function animate(time) {
      wgl.background();

      wgl.setVariable(program.uniforms.mView, wgl.mView);

      for (const i in wgl.models) {
        wgl.models[i].enableAttribs(program.attribs.position, program.attribs.vertNorm);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wgl.models[i].ibo)
        gl.drawElements(gl.TRIANGLES, wgl.models[i].nPoints, gl.UNSIGNED_SHORT, 0);

        //cleanup
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }

      wgl.camera.doMovement(wgl.mView, time);

      requestAnimationFrame(animate);
    }
    animate();
  }

}