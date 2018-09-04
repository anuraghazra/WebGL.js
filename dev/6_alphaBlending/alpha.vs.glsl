precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

varying vec3 vNormal;
varying vec3 vPos;
varying vec2 vTexCoord;

uniform mat4 uWorld;
uniform mat4 uProj;
uniform mat4 uView;

void main(void) {
  gl_Position = uProj * uView * uWorld * vec4(aPosition, 1.0);
  vPos = vec3(uWorld * vec4(aPosition, 1.0));
  vNormal = aNormal;
  vTexCoord = aTexCoord;
}