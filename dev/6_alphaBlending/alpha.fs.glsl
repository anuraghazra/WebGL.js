precision mediump float;

varying vec3 vNormal;
varying vec3 vPos;
varying vec2 vTexCoord;


uniform sampler2D tex;

const float lightIntensity = 1.0;
const vec3 lightPos = vec3(-20, 1.0, 1.0);
const vec3 lightColor = vec3(1.0, 1.0, 1.0);

void main(void) {
  vec4 texel = vec4(texture2D(tex, vTexCoord));

  float ambientStrength = 0.2;
  vec3 ambient = ambientStrength * vec3(1.0,1.0,1.0);

  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(lightPos - vPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * (lightColor + lightIntensity);

  vec3 result = (ambient + diffuse) * texel.rgb;
  
  // discard alpha channel
  // if(texel.a < 1.0) {
  //   discard;
  // }

  gl_FragColor = vec4(result, texel.a);
}