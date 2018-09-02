precision mediump float;


attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;


uniform mat4 uWorld;
uniform mat4 uView;
uniform mat4 uProj;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vFragPos;

void main() {
  vTexCoord = aTexCoord;
  vFragPos = vec3(uWorld * vec4(aPosition, 1.0));
  vNormal = mat3(uWorld) * aNormal;
  gl_Position = uProj * uView * uWorld * vec4(aPosition, 1.0);
}