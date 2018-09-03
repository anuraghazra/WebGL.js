precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vFragPos;

uniform vec3 uEyeView;

// Material
struct Material {
  float useTexture;
  float shadeless;
  float blinn;
  vec3 ambient;
  float shininess;
  float specularIntensity;
  vec3 diff_color;
  vec3 spec_color;
  sampler2D diffuse;
  sampler2D specular;
};

uniform Material material;

// Lights
#define NR_POINT_LIGHTS 20
#define NR_SUN_LIGHTS 5

struct PointLight {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float constant;
  float linear;
  float quadratic;
};
uniform PointLight pointlights[NR_POINT_LIGHTS];

struct DirLight {
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};
uniform DirLight dirlight[NR_SUN_LIGHTS];


// ============= Functions
vec3 initDiffuse(vec3 tex) {
  if (material.useTexture == 0.0) {
    tex = vec3(material.diff_color);
  } else if (material.useTexture == 1.0) {
    tex = vec3(texture2D(material.diffuse, vTexCoord)) * material.diff_color;
  }
  return tex;
}
vec3 initSpecular(vec3 tex) {
  if (material.useTexture == 0.0) {
    tex = vec3(material.spec_color);
  } else if (material.useTexture == 1.0) {
    tex = vec3(texture2D(material.specular, vTexCoord)) * material.spec_color;
  }
  return tex;
}

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
  vec3 diffuseTexture = initDiffuse(vec3(texture2D(material.diffuse, vTexCoord)));
  vec3 specularTexture = initSpecular(vec3(texture2D(material.specular, vTexCoord)) * material.spec_color);

  vec3 lightDir = normalize(-light.direction);
  
  // diffuse
  float diff = max(dot(normal, lightDir), 0.0);
  
  // specular
  float spec = 0.0;
  if (material.blinn == 1.0) {
    vec3 halfway = normalize(lightDir + viewDir);
    spec = pow( max(dot(normal, halfway), 0.0), material.shininess) * material.specularIntensity;
  } else {
    vec3 reflectDir = reflect(-lightDir, normal);
    spec = pow( max(dot(viewDir, reflectDir), 0.0), material.shininess) * material.specularIntensity;
  }
  
  // combine results
  vec3 ambient = light.ambient * (diffuseTexture * material.ambient);
  vec3 diffuse = light.diffuse * diff * diffuseTexture;
  vec3 specular = light.specular * spec * specularTexture;

  return (ambient + diffuse + specular);
}


vec3 CalcPointLight(PointLight light, vec3 normal, vec3 vFragPos, vec3 viewDir) {
  vec3 diffuseTexture = initDiffuse(vec3(texture2D(material.diffuse, vTexCoord)));
  vec3 specularTexture = initSpecular(vec3(texture2D(material.specular, vTexCoord)) * material.spec_color);


  vec3 lightDir = normalize(light.position - vFragPos);
  // diffuse
  float diff = max(dot(normal, lightDir), 0.0);

  // specular
  float spec = 0.0;
  if(material.blinn == 1.0) {
    vec3 halfway = normalize(lightDir + viewDir);
    spec = pow( max(dot(normal, halfway), 0.0), material.shininess) * material.specularIntensity;
  } else {
    vec3 reflectDir = reflect(-lightDir, normal);
    spec = pow( max(dot(viewDir, reflectDir), 0.0), material.shininess) * material.specularIntensity;
  }
  
  // attenuation
  float dist = length(light.position - vFragPos);
  float attenuation = 1.0 / (light.constant + light.linear * dist + light.quadratic * (dist * dist));
  
  // combine results
  vec3 ambient = light.ambient * (diffuseTexture * material.ambient);
  vec3 diffuse = light.diffuse * diff * diffuseTexture;
  vec3 specular = light.specular * spec * specularTexture;
  ambient *= attenuation;
  diffuse *= attenuation;
  specular *= attenuation;

  return (ambient + diffuse + specular);
}

// END Functions ============= >>

void main() {
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(uEyeView - vFragPos);
  
  vec3 result = vec3(0.0);

  if (material.shadeless == 1.0) {
    result = initDiffuse(vec3(texture2D(material.diffuse, vTexCoord)));
  } else {
    // directional lighting
    for(int i = 0; i < NR_SUN_LIGHTS; i++) {
      result += CalcDirLight(dirlight[i], norm, viewDir);
    }
    // point lights
    for(int i = 0; i < NR_POINT_LIGHTS; i++) {
      result += CalcPointLight(pointlights[i], norm, vFragPos, viewDir);
    }
  }

  gl_FragColor = vec4(result, 1.0);

}