precision mediump float;

varying vec3 fragNormal;
varying vec3 fragPos;

const float lightIntensity = 1.0;
const vec3 lightPos = vec3(-20, 1.0, 1.0);
const vec3 lightColor = vec3(1.0, 1.0, 1.0);
float near = 0.1;
float far = 100.0;

float LinearizeDepth(float depth)
{
float z = depth * 2.0 - 1.0; // back to NDC
return (2.0 * near * far) / (far + near - z * (far - near));
}

void main(void) {
  float depth = LinearizeDepth(gl_FragCoord.z) / far;

  float ambientStrength = 0.2;
  vec3 ambient = ambientStrength * vec3(0.0,1.0,1.0);

  vec3 norm = normalize(fragNormal);
  vec3 lightDir = normalize(lightPos - fragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * (lightColor + lightIntensity);

  vec3 result = (ambient + diffuse) * vec3(0.0,0.6, 1.0);
  gl_FragColor = vec4(vec3(depth), 1.0);
}