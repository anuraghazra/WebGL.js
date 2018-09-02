precision mediump float;

attribute vec3 aPosition;
attribute vec3 aColor;
attribute vec3 aNormal;
attribute vec2 aTexCoord;


uniform mat4 uWorld;
uniform mat4 uProj;
uniform mat4 uView;


varying vec2 vTexCoord;
varying vec3 vNormal;

void main(void) {
  vTexCoord = aTexCoord;
  vNormal = (uWorld * vec4(aNormal, 0.0)).xyz;
  gl_Position = uProj * uView * uWorld * vec4(aPosition, 1.0);
}