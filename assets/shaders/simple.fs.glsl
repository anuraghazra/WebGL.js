precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform sampler2D uSampler;

struct Light {
  vec3 ambient;
  vec3 sun;
  vec3 dir;
};

uniform Light light;

void main(void) {

  vec4 texel = texture2D(uSampler, vTexCoord);

  vec3 lightintensity = light.ambient + light.sun * max(dot(vNormal, light.dir), 0.0);

  gl_FragColor = vec4(texel.rgb * lightintensity, texel.a);
}