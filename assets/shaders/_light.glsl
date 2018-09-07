
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

vec3 CalcSpotLight(SpotLight light, vec3 vFragPos, vec3 viewDir, vec3 normal) {
  vec3 diffuseTexture = initDiffuse(vec3(texture2D(material.diffuse, vTexCoord)));
  vec3 specularTexture = initSpecular(vec3(texture2D(material.specular, vTexCoord)) * material.spec_color);

  vec3 color = vec3(0.0);

  vec3 lightDir = normalize(light.position - vFragPos);
  float theta = dot(lightDir, normalize(-light.direction));
  float epsilon = light.outerCutOff - light.cutOff;
  float intensity = clamp((theta - light.cutOff) / epsilon, 0.0, 1.0);

  if (theta > light.cutOff) {
    // diffuse
    float diff = max(dot(normal, lightDir), 0.0);

    // specular
    float spec = 0.0;
    vec3 halfway = normalize(lightDir + viewDir);
    spec = pow( max(dot(normal, halfway), 0.0), material.shininess) * material.specularIntensity;
    vec3 diffuse = light.diffuse * diff * diffuseTexture;
    vec3 specular = light.specular * spec * specularTexture;
    diffuse *= intensity;
    specular *= intensity;
    color = (diffuse + specular);
  } else {
    color = (light.ambient * (diffuseTexture)) * intensity;
  }
  return color;
}

// END Functions ============= >>