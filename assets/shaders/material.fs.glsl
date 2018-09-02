precision mediump float;

#define NR_POINT_LIGHTS 4

varying vec3 fragNormal;
varying vec3 fragPos;
varying vec2 fragTexCoord;

uniform vec3 cameraPos;

struct Material {
  vec3 ambient;
  float shininess;
  sampler2D diffuse;
  sampler2D specular;
};

struct PointLight {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float constant;
  float linear;
  float quadratic;
};

uniform PointLight pointlights[4];

struct DirLight {
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};
uniform DirLight dirlight;


uniform Material material;

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
  vec3 diffuseTexture = vec3(texture2D(material.diffuse, fragTexCoord));
  vec3 specularTexture = vec3(texture2D(material.specular, fragTexCoord));

  vec3 lightDir = normalize(-light.direction);
  
  // diffuse
  float diff = max(dot(normal, lightDir), 0.0);
  
  // specular
  // vec3 halfway = normalize(lightDir + viewDir);
  // float spec = pow( max(dot(normal, halfway), 0.0), material.shininess);
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow( max(dot(viewDir, reflectDir), 0.0), material.shininess);
  
  // combine results
  vec3 ambient = light.ambient * diffuseTexture;
  vec3 diffuse = light.diffuse * diff * diffuseTexture;
  vec3 specular = light.specular * spec * specularTexture;
  return (ambient + diffuse + specular);
}

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
  vec3 diffuseTexture = vec3(texture2D(material.diffuse, fragTexCoord));
  vec3 specularTexture = vec3(texture2D(material.specular, fragTexCoord));

  vec3 lightDir = normalize(light.position - fragPos);
  // diffuse
  float diff = max(dot(normal, lightDir), 0.0);

  // specular
  vec3 halfway = normalize(lightDir + viewDir);
  vec3 reflectDir = reflect(-lightDir, normal);
  // float spec = pow( max(dot(viewDir, reflectDir), 0.0), material.shininess);
  float spec = pow( max(dot(normal, halfway), 0.0), material.shininess);
  
  // attenuation
  float dist = length(light.position - fragPos);
  float attenuation = 1.0 / (light.constant + light.linear * dist + light.quadratic * (dist * dist));
  
  // combine results
  vec3 ambient = light.ambient * diffuseTexture;
  vec3 diffuse = light.diffuse * diff * diffuseTexture;
  vec3 specular = light.specular * spec * specularTexture;
  ambient *= attenuation;
  diffuse *= attenuation;
  specular *= attenuation;
  return (ambient + diffuse + specular);
}

void main(void) {
  // props
  vec3 norm = normalize(fragNormal);
  vec3 viewDir = normalize(cameraPos - fragPos);
  // step-1 directional lighting
  vec3 result = CalcDirLight(dirlight, norm, viewDir);
  // step-2 point lights
  for(int i = 0; i < NR_POINT_LIGHTS; i++) {
    result += CalcPointLight(pointlights[i], norm, fragPos, viewDir);
  }
  gl_FragColor = vec4(result, 1.0);

}

