precision mediump float;

attribute vec3 position;
attribute vec3 vertNorm;
attribute vec2 aTexCoord;

varying vec3 fragNormal;
varying vec3 fragPos;
varying vec2 fragTexCoord;

uniform mat4 uWorld;
uniform mat4 uProj;
uniform mat4 uView;
uniform vec3 translation;
uniform vec3 scaling;

void main(void) {
  gl_Position = uProj * uView * uWorld * vec4(position, 1.0);
  
  fragPos = vec3(uWorld * vec4(position, 1.0));
  fragNormal = vertNorm;
  fragNormal = mat3(uWorld) * vertNorm;
  fragTexCoord = aTexCoord;
}