window.onload = function () {
  let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);

  wgl.init({
    shaders: {
      simple: {
        type: 'URL',
        path: '../../assets/shaders/',
        vert: 'material.vs.glsl',
        frag: 'material.fs.glsl',
      },
    },
    models: {
      suzane: {
        mesh: '../../assets/models/teapot.json',
        tex : true,
      }
    },
    assets : {
      diff: '../../assets/textures/tiles.jpg',
      spec : '../../assets/textures/tiles_spec.jpg',
    },
    onDone: load
  })

  function load() {

    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);
    wgl.gl.useProgram(program);
    console.log(program)

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

    let difmap = wgl.setupTexture(wgl.assets.diff, {
      WRAP_S : wgl.gl.REPEAT,
      WRAP_T : wgl.gl.REPEAT,
    });

    let specmap = wgl.setupTexture(wgl.assets.spec, {
      WRAP_S : wgl.gl.REPEAT,
      WRAP_T : wgl.gl.REPEAT,
    });

    function animate(time) {
      wgl.background(0.1,0.1,0.1);

      
      wgl.setStructVariables(program.uniforms, 'material', {
        ambient : [0.2, 0.2, 0.2], 
        diffuse : [difmap, 0],
        specular : [specmap, 1],
        shininess : 32.0,
      });

      function PointLight(index, data) {
        var pl_pos = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].position');
        var pl_diff = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].diffuse');
        var pl_ambi = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].ambient');
        var pl_spec = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].specular');
        var pl_cons = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].constant');
        var pl_line = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].linear');
        var pl_quad = wgl.gl.getUniformLocation(program, 'pointlights['+index+'].quadratic');
        wgl.setVariable(pl_pos, data.pos);
        wgl.setVariable(pl_ambi, data.ambient);
        wgl.setVariable(pl_diff, data.diffuse);
        wgl.setVariable(pl_spec, data.specular);
        wgl.setVariable(pl_cons, data.constant);
        wgl.setVariable(pl_line, data.linear);
        wgl.setVariable(pl_quad, data.quadratic);
      }
      PointLight(0, {
        pos : [0.0, -0.0, 6.0],
        ambient : [0.5, 0.5, 0.5],
        diffuse : [0.0, 1.0, 0.0],
        specular :  [1.0, 1.0, 1.0],
        constant : 1.0,
        linear : 0.035,
        quadratic : 0.044,
      })
      PointLight(1, {
        pos : [0.0, -5.0, -5.0],
        ambient : [0.5, 0.5, 0.5],
        diffuse : [0.0, 0.0, 0.5],
        specular :  [1.0, 1.0, 1.0],
        constant : 1.0,
        linear : 0.035,
        quadratic : 0.044,
      });
      PointLight(2, {
        pos : [-5, -3.0, 0.0],
        ambient : [0.5, 0.5, 0.5],
        diffuse : [1.0, 0.0, 1.0],
        specular :  [1.0, 1.0, 1.0],
        constant : 1.0,
        linear : 0.035,
        quadratic : 0.044,
      });
      PointLight(3, {
        pos : [5, -3.0, 0.0],
        ambient : [0.5, 0.5, 0.5],
        diffuse : [0.0, 1.0, 1.0],
        specular :  [1.0, 1.0, 1.0],
        constant : 1.0,
        linear : 0.035,
        quadratic : 0.044,
      });

      wgl.setStructVariables(program.uniforms, 'dirlight', {
        direction : [-0.2, -1.0, -0.3], 
        position : [0.0, -0.4, 0.0], 
        ambient : [0.5, 0.5, 0.5], 
        diffuse : [0.5, 0.0, 0.0], 
        specular : [1.0, 1.0, 1.0],
      });

      wgl.setVariable(program.uniforms.mView, wgl.mView);
      wgl.setVariable(program.uniforms.cameraPos, wgl.camera.position);
      
      for (const i in wgl.models) {
        wgl.setVariable(program.uniforms.translation, wgl.models[i].translation);
        wgl.models[i].enableAttribs(program.attribs.position, program.attribs.vertNorm, program.attribs.aTexCoord);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wgl.models[i].ibo)
        gl.drawElements(gl.TRIANGLES, wgl.models[i].nPoints, gl.UNSIGNED_SHORT, 0);
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