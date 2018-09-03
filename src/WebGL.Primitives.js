// WebGL.createPlane = function () {
//   let scale = 20.0; 
//   var positions = [
//     -scale , -scale , 0,
//     scale , -scale , 0,
//     scale , scale , 0,
//     -scale , scale , 0
//   ]
//   var normals = [
//     0 , 0 , 1 ,
//     0 , 0 , 1 ,
//     0 , 0 , 1 ,
//     0 , 0 , 1
//   ];
//   var uvs = [
//     0, 0,
//     0, 1,
//     1, 1,
//     1, 0,
//   ];
//   var indices = [
//     0, 1, 2,
//     0, 2, 3
//   ];

//   let schema = {
//     meshes: {
//       0: {
//         name: 'plane',
//         vertices: positions,
//         normals: normals,
//         texturecoords: [uvs],
//         indices: indices
//       }
//     }
//   }
//   return schema;
// }

WebGL.createPlane = function ({depth = 1, scale = 5}) {
  var vertices = [
    -scale, -scale , 0
    , -scale , scale , 0
    , scale , scale , 0
    , scale , -scale, 0
    , -scale , -scale , depth
    , scale , -scale , depth
    , scale , scale , depth
    , -scale , scale , depth
    , -scale , scale , 0
    , -scale , -scale , 0
    , -scale , -scale , depth
    , -scale , scale , depth
    , -scale , scale , 0
    , -scale , scale , depth
  ]

  let normals = [
    -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
  ]

  let uvs = [
    0.901143 ,0.5
   ,1.62856e-007 ,0.5
   ,0 ,9.0361e-008
   ,0.901143 ,0
   ,1.62856e-007 ,1
   ,0 ,0.5
   ,0.901143 ,0.5
   ,0.901143 ,1
   ,0.925857,0
   ,0.925858,0.5
   ,0.901144,0.5
   ,0.901143,0
   ,1,0
   ,1,0.5
   ,0.975286,0.5
   ,0.975286,0
   ,0.950572,0
   ,0.950572,0.5
   ,0.925858,0.5
   ,0.925858,0
   ,0.950572,0.5
   ,0.950572,0
   ,0.975286,0
   ,0.975286,0.5
 ]

  let indices = [
    [
      0
      , 1
      , 2
    ]
    , [
      0
      , 2
      , 3
    ]
    , [
      3
      , 2
      , 6
    ]
    , [
      2
      , 12
      , 13
    ]
    , [
      2
      , 13
      , 6
    ]
    , [
      3
      , 6
      , 5
    ]
    , [
      9
      , 3
      , 5
    ]
    , [
      4
      , 5
      , 6
    ]
    , [
      4
      , 6
      , 7
    ]
    , [
      9
      , 5
      , 10
    ]
    , [
      8
      , 9
      , 10
    ]
    , [
      8
      , 10
      , 11
    ]
  ];

  vertices = new Float32Array(vertices);
  normals = new Float32Array(normals);
  uvs = new Float32Array(uvs);

  indices = [].concat.apply([], indices);
  indices = new Uint16Array(indices);

  let schema = {
    meshes: {
      0: {
        name: 'plane',
        vertices: vertices,
        normals: normals,
        texturecoords: [uvs],
        indices: indices
      }
    }
  }
  return schema;
}

WebGL.createSphere = function createSphere(options) {
  options = options || {};

  var long_bands = options.segs || 8;
  var lat_bands = options.rigns || 8;
  var radius = options.radius || 1;
  var lat_step = Math.PI / lat_bands;
  var long_step = 2 * Math.PI / long_bands;
  var num_positions = long_bands * lat_bands * 4;
  var num_indices = long_bands * lat_bands * 6;
  var lat_angle, long_angle;
  var positions = new Float32Array(num_positions * 3);
  var normals = new Float32Array(num_positions * 3);
  var uvs = new Float32Array(num_positions * 2);
  var indices = new Uint16Array(num_indices);
  var x1, x2, x3, x4,
    y1, y2,
    z1, z2, z3, z4,
    u1, u2,
    v1, v2;
  var i, j;
  var k = 0, l = 0;
  var vi, ti;

  for (i = 0; i < lat_bands; i++) {
    lat_angle = i * lat_step;
    y1 = Math.cos(lat_angle);
    y2 = Math.cos(lat_angle + lat_step);
    for (j = 0; j < long_bands; j++) {
      long_angle = j * long_step;
      x1 = Math.sin(lat_angle) * Math.cos(long_angle);
      x2 = Math.sin(lat_angle) * Math.cos(long_angle + long_step);
      x3 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle);
      x4 = Math.sin(lat_angle + lat_step) * Math.cos(long_angle + long_step);
      z1 = Math.sin(lat_angle) * Math.sin(long_angle);
      z2 = Math.sin(lat_angle) * Math.sin(long_angle + long_step);
      z3 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle);
      z4 = Math.sin(lat_angle + lat_step) * Math.sin(long_angle + long_step);
      u1 = 1 - j / long_bands;
      u2 = 1 - (j + 1) / long_bands;
      v1 = 1 - i / lat_bands;
      v2 = 1 - (i + 1) / lat_bands;
      vi = k * 3;
      ti = k * 2;

      positions[vi] = x1 * radius;
      positions[vi + 1] = y1 * radius;
      positions[vi + 2] = z1 * radius; //v0

      positions[vi + 3] = x2 * radius;
      positions[vi + 4] = y1 * radius;
      positions[vi + 5] = z2 * radius; //v1

      positions[vi + 6] = x3 * radius;
      positions[vi + 7] = y2 * radius;
      positions[vi + 8] = z3 * radius; // v2


      positions[vi + 9] = x4 * radius;
      positions[vi + 10] = y2 * radius;
      positions[vi + 11] = z4 * radius; // v3

      normals[vi] = x1;
      normals[vi + 1] = y1;
      normals[vi + 2] = z1;

      normals[vi + 3] = x2;
      normals[vi + 4] = y1;
      normals[vi + 5] = z2;

      normals[vi + 6] = x3;
      normals[vi + 7] = y2;
      normals[vi + 8] = z3;

      normals[vi + 9] = x4;
      normals[vi + 10] = y2;
      normals[vi + 11] = z4;

      uvs[ti] = u1;
      uvs[ti + 1] = v1;

      uvs[ti + 2] = u2;
      uvs[ti + 3] = v1;

      uvs[ti + 4] = u1;
      uvs[ti + 5] = v2;

      uvs[ti + 6] = u2;
      uvs[ti + 7] = v2;

      indices[l] = k;
      indices[l + 1] = k + 1;
      indices[l + 2] = k + 2;
      indices[l + 3] = k + 2;
      indices[l + 4] = k + 1;
      indices[l + 5] = k + 3;

      k += 4;
      l += 6;
    }
  }

  let schema = {
    meshes: {
      0: {
        name: 'sphere',
        vertices: positions,
        normals: normals,
        texturecoords: [uvs],
        indices: indices
      }
    }
  }
  return schema;
}


WebGL.createBox = function ({width = 1, height = 1, depth = 1, scale = 1.0}) {
  width *= scale;
  height *= scale;
  depth *= scale;
  let vertices = [
    -width , -depth , -height
    , -width , -depth , height
    , -width , depth , height
    , -width , depth , -height

    , -width , depth , -height
    , -width , depth , height
    , width , depth , height
    , width , depth , -height

    , width , depth , -height
    , width , depth , height
    , width , -depth , height
    , width , -depth , -height

    , width , -depth , -height
    , width , -depth , height
    , -width , -depth , height
    , -width , -depth , -height

    , -width , depth , -height
    , width , depth , -height
    , width , -depth , -height
    , -width , -depth , -height
    
    , width , depth , height
    , -width , depth , height
    , -width , -depth , height
    , width , -depth , height
  ]
  let normals = [
    -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , -0.577349
    , 0.577349
    , 0.577349
    , -0.577349
    , 0.577349
  ]
  let uvs = [
    0
    , 0
    , 1
    , 0
    , 1
    , 1
    , 0
    , 1
    , 0
    , 0
    , 1
    , 0
    , 1
    , 1
    , 0
    , 1
    , 0
    , 0
    , 1
    , 0
    , 1
    , 1
    , 0
    , 1
    , 0
    , 0
    , 1
    , 0
    , 1
    , 1
    , 0
    , 1
    , 0
    , 0
    , 1
    , 0
    , 1
    , 1
    , 0
    , 1
    , 0
    , 0
    , 1
    , 0
    , 1
    , 1
    , 0
    , 1
  ]
  let indices = [
    [
      0
      , 1
      , 2
    ]
    , [
      0
      , 2
      , 3
    ]
    , [
      4
      , 5
      , 6
    ]
    , [
      4
      , 6
      , 7
    ]
    , [
      8
      , 9
      , 10
    ]
    , [
      8
      , 10
      , 11
    ]
    , [
      12
      , 13
      , 14
    ]
    , [
      12
      , 14
      , 15
    ]
    , [
      16
      , 17
      , 18
    ]
    , [
      16
      , 18
      , 19
    ]
    , [
      20
      , 21
      , 22
    ]
    , [
      20
      , 22
      , 23
    ]
  ]


  vertices = new Float32Array(vertices);
  normals = new Float32Array(normals);
  uvs = new Float32Array(uvs);

  indices = [].concat.apply([], indices);
  indices = new Uint16Array(indices);

  let schema = {
    meshes: {
      0: {
        name: 'plane',
        vertices: vertices,
        normals: normals,
        texturecoords: [uvs],
        indices: indices
      }
    }
  }
  return schema;
}