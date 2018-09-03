// #version 300 es
precision mediump float;

attribute vec3 aPos;
varying vec3 TexCoords;

uniform mat4 projection;
uniform mat4 view;

void main() {
  TexCoords = aPos;
  gl_Position = projection * view * vec4(aPos, 1.0);
}