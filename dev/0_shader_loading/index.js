window.onload = function () {
  let wgl = new WebGL('#c', window.innerWidth, window.innerHeight);

  let vert = `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
attribute vec3 vertNormal;
attribute vec2 aTexCoord;


uniform mat4 mWorld;
uniform mat4 mProj;
uniform mat4 mView;


varying vec2 fragTexCoord;
varying vec3 fragNormal;

void main(void) {
  fragTexCoord = aTexCoord;
  fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;
  gl_Position = mProj * mView * mWorld * vec4(position, 1.0);
}
`

  let frag = `
precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform sampler2D sampler;


struct Light {
  vec3 ambient;

  vec3 sun;
  
  vec3 dir;
};

uniform Light light;

void main(void) {

  vec4 texel = texture2D(sampler, fragTexCoord);

  vec3 lightintensity = light.ambient + light.sun * max(dot(fragNormal, light.dir), 0.0);

  gl_FragColor = vec4(texel.rgb * lightintensity, texel.a);
}
`

  wgl.init({
    shaders: {
      simple: {
        // type: 'STRING',
        // path: '../../assets/shaders/',
        // vert: vert,
        // frag: frag,
        // type: 'DOM',
        // path : '../../assets/shaders/',
        // vert: '#vert',
        // frag: '#frag',
        type: 'URL',
        path : '../../assets/shaders/',
        vert: 'simple.vs.glsl',
        frag: 'simple.fs.glsl',
      },
    },
    models: {
      suzane: {
        mesh: '../../assets/models/teapot.json',
        tex: '../../assets/textures/iron-rusted4-basecolor.png',
      }
    },
    onDone: load
  })

  function load() {
    wgl.enable3DDepth();
    let gl = wgl.gl;

    let program = wgl.createProgram(wgl.shaders.simple.vert, wgl.shaders.simple.frag);

    wgl.gl.useProgram(program)

    console.log({ frag: wgl.shaders.simple.frag })

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

      wgl.setVariable(program.uniforms.mView, wgl.mView)

      wgl.setStructVariables(program.uniforms, 'light', {
        ambient: [0.5, 0.5, 0.5],
        sun: [0.2, 0.2, 0.2],
        dir: [-1, -10, 1],
      })

      for (const i in wgl.models) {
        wgl.models[i].enableAttribs(program.attribs.position, program.attribs.vertNormal, program.attribs.aTexCoord);
        wgl.useTexture(wgl.models[i].texture, program.uniforms.sampler, 0)

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