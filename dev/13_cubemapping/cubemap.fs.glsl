// #version 300 es
precision mediump float;

varying vec3 TexCoords;


uniform samplerCube skybox;

void main() {
  vec4 FragColor = vec4(0.0);
  gl_FragColor = textureCube(skybox, TexCoords);
}