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

#include "_light.glsl";

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