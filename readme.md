# WebGL.js

## Yet Another WebGL Library For Personal Use

Honestly WebGL Am Not That Good At WebGL. I Just Started Learning WebGL From Past 4 Months, So I Took A Step To `Make WebGL Easy` For Me And End Up With This Library, I Know I Know Its Not The Best But It Will Do The Work.

## Really Simple Example

```javascript
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
    assets: {
      tile: '../../assets/textures/tiles.jpg',
      tilespec: '../../assets/textures/tiles_spec.jpg',
    },
    onDone: onDone
  });


  function onDone() {
    wgl.enable3DDepth();

    let program = wgl.createProgram(wgl.shaders.modular.vert, wgl.shaders.modular.frag);
    wgl.useShader(program);

    wgl.camera({
      pos: [0, -20, 0],
      world: program.uniforms.uWorld,
      view: program.uniforms.uView,
      proj: program.uniforms.uProj,
    });

    // Load Models
    let cube = new WebGL.Model(wgl, {
      material: {
        useTexture: 1,
        shadeless : 0,
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
        diff_color: [1.0, 1.0, 1.0],
        spec_color: [1.0, 1.0, 1.0],
      },
      pos: [0, 0, 0],
      program: program,
      data:  WebGL.createBox({})
    });

    let torus = new WebGL.Model(wgl, {
      material : {
        useTexture: 1,
        shadeless : 0,
        diffuse: wgl.assets.tile,
        specular: wgl.assets.tilespec,
      },
      pos: [-5, 0, 0],
      program: program,
      data:  WebGL.createTorus(3,1,30,30)
    });

    let dlight = new WebGL.SunLight(program, 0, {
      direction : [0, -20, -10.0],
      ambient : [0.5, 0.5, 0.5],
      diffuse : [1, 1, 1],
      specular : [1.0, 1.0, 1.0],
    });

    let plight = new WebGL.PointLight(program, 0, {
      pos : [-4.0, -2.0, 2.0],
      ambient : [0, 0, 0],
      diffuse : [1.0, 0.0, 1.0],
      specular :  [1.0, 0.0, 0.0],
      mesh : WebGL.createSphere({radius : 0.1})
    });

    function animate(time) {
      wgl.background();
      wgl.setVariable(program.uniforms.uEyeView, wgl.cam.position)
      wgl.setVariable(program.uniforms.uView, wgl.uView);
      
      plight.setPosition([-5, Math.cos(0.5*time/1000)*5,0]);
      plight.render();

      cube.render();
      torus.render();
      
      wgl.cam.doMovement(wgl.uView, time);
      requestAnimationFrame(animate);
    }
    animate();
  }
}

```