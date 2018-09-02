precision mediump float;

attribute vec3 position;
attribute vec3 vertNorm;

varying vec3 fragNormal;
varying vec3 fragPos;

uniform mat4 mWorld;
uniform mat4 mProj;
uniform mat4 mView;

void main(void) {
  gl_Position = mProj * mView * mWorld * vec4(position, 1.0);
  fragPos = vec3(mWorld * vec4(position, 1.0));
  fragNormal = vertNorm;
}