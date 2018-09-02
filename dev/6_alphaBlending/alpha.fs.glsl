precision mediump float;

varying vec3 fragNormal;
varying vec3 fragPos;

const float lightIntensity = 1.0;
const vec3 lightPos = vec3(-20, 1.0, 1.0);
const vec3 lightColor = vec3(1.0, 1.0, 1.0);

uniform sampler2D tex;
varying vec2 fragTexCoord;

void main(void) {
  vec4 texel = vec4(texture2D(tex, fragTexCoord));

  float ambientStrength = 0.2;
  vec3 ambient = ambientStrength * vec3(1.0,1.0,1.0);

  vec3 norm = normalize(fragNormal);
  vec3 lightDir = normalize(lightPos - fragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * (lightColor + lightIntensity);

  vec3 result = (ambient + diffuse) * texel.rgb;
  
  // discard alpha channel
  // if(texel.a < 1.0) {
  //   discard;
  // }

  gl_FragColor = vec4(result, texel.a);
}