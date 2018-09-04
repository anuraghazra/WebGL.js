WebGL.createPlane = function ({ depth = 1, scale = 5 }) {
  var vertices = [
    -scale, -scale, 0
    , -scale, scale, 0
    , scale, scale, 0
    , scale, -scale, 0
    , -scale, -scale, depth
    , scale, -scale, depth
    , scale, scale, depth
    , -scale, scale, depth
    , -scale, scale, 0
    , -scale, -scale, 0
    , -scale, -scale, depth
    , -scale, scale, depth
    , -scale, scale, 0
    , -scale, scale, depth
  ]
  let n = 1;
  let normals = [
    -n
    , -n
    , -n
    , -n
    , n
    , -n
    , n
    , n
    , -n
    , n
    , -n
    , -n
    , -n
    , -n
    , n
    , n
    , -n
    , n
    , n
    , n
    , n
    , -n
    , n
    , n
    , -n
    , n
    , -n
    , -n
    , -n
    , -n
    , -n
    , -n
    , n
    , -n
    , n
    , n
    , -n
    , n
    , -n
    , -n
    , n
    , n
  ]

  let uvs = [
    0.901143, 0.5
    , 1.62856e-007, 0.5
    , 0, 9.0361e-008
    , 0.901143, 0
    , 1.62856e-007, 1
    , 0, 0.5
    , 0.901143, 0.5
    , 0.901143, 1
    , 0.925857, 0
    , 0.925858, 0.5
    , 0.901144, 0.5
    , 0.901143, 0
    , 1, 0
    , 1, 0.5
    , 0.975286, 0.5
    , 0.975286, 0
    , 0.950572, 0
    , 0.950572, 0.5
    , 0.925858, 0.5
    , 0.925858, 0
    , 0.950572, 0.5
    , 0.950572, 0
    , 0.975286, 0
    , 0.975286, 0.5
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

// ==========================================||>
// =========BELOW CODES ARE NOT MINE=========||>
// ==========================================||>
// ==========================================||>

/*
 * Copyright 2009, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @method WebGL.createPlaneSubdivide()
 * @type STATIC
 * this code is taken from http://webglfundamentals.org/
 * @url http://webglfundamentals.org/
 */
WebGL.createPlaneSubdivide = function (
  width,
  depth,
  subdivisionsWidth,
  subdivisionsDepth) {
  if (subdivisionsWidth <= 0 || subdivisionsDepth <= 0) {
    throw Error('subdivisionWidth and subdivisionDepth must be > 0');
  }

  var numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
  var positions = [];
  var normals = [];
  var texCoords = [];

  for (var z = 0; z <= subdivisionsDepth; z++) {
    for (var x = 0; x <= subdivisionsWidth; x++) {
      var u = x / subdivisionsWidth;
      var v = z / subdivisionsDepth;
      positions.push([
        width * u - width * 0.5,
        0,
        depth * v - depth * 0.5
      ]);
      normals.push([0, 1, 0]);
      texCoords.push([u, v]);
    }
  }

  var numVertsAcross = subdivisionsWidth + 1;
  // var indices = new Uint16Array(subdivisionsWidth * subdivisionsDepth * 2);
  var indices = [];

  for (var z = 0; z < subdivisionsDepth; z++) {
    for (var x = 0; x < subdivisionsWidth; x++) {
      // Make triangle 1 of quad.
      indices.push([
        (z + 0) * numVertsAcross + x,
        (z + 1) * numVertsAcross + x,
        (z + 0) * numVertsAcross + x + 1]);

      // Make triangle 2 of quad.
      indices.push([
        (z + 1) * numVertsAcross + x,
        (z + 1) * numVertsAcross + x + 1,
        (z + 0) * numVertsAcross + x + 1]);
    }
  }

  positions = [].concat.apply([], positions);
  normals = [].concat.apply([], normals);
  texCoords = [].concat.apply([], texCoords);
  indices = [].concat.apply([], indices);

  positions = new Float32Array(positions);
  normals = new Float32Array(normals);
  texCoords = new Float32Array(texCoords);
  indices = new Uint16Array(indices);
  let schema = {
    meshes: {
      0: {
        name: 'planeMesh',
        vertices: positions,
        normals: normals,
        texturecoords: [texCoords],
        indices: indices
      }
    }
  }
  return schema;
};

/**
 * @method WebGL.createBox()
 * @type STATIC
 * this code is taken from http://webglfundamentals.org/
 * @url http://webglfundamentals.org/
 */
WebGL.createBox = function ({ width = 1, height = 1, depth = 1 }) {

  let CUBE_FACE_INDICES_ = [
    [3, 7, 5, 1], // right
    [6, 2, 0, 4], // left
    [6, 7, 3, 2], // ??
    [0, 1, 5, 4], // ??
    [7, 6, 4, 5], // front
    [2, 3, 1, 0]  // back
  ];

  var cornerVertices = [
    [-width, -height, -depth],
    [+width, -height, -depth],
    [-width, +height, -depth],
    [+width, +height, -depth],
    [-width, -height, +depth],
    [+width, -height, +depth],
    [-width, +height, +depth],
    [+width, +height, +depth]
  ];

  var faceNormals = [
    [+1, +0, +0],
    [-1, +0, +0],
    [+0, +1, +0],
    [+0, -1, +0],
    [+0, +0, +1],
    [+0, +0, -1]
  ];

  var uvCoords = [
    [1, 0],
    [0, 0],
    [0, 1],
    [1, 1]
  ];

  var numVertices = 6 * 4;
  var positions = [];
  var normals = [];
  var texCoords = [];
  var indices = [];

  for (var f = 0; f < 6; ++f) {
    var faceIndices = CUBE_FACE_INDICES_[f];
    for (var v = 0; v < 4; ++v) {
      var position = cornerVertices[faceIndices[v]];
      var normal = faceNormals[f];
      var uv = uvCoords[v];

      // Each face needs all four vertices because the normals and texture
      // coordinates are not all the same.
      positions.push(position);
      normals.push(normal);
      texCoords.push(uv);

    }
    // Two triangles make a square face.
    var offset = 4 * f;
    indices.push([offset + 0, offset + 1, offset + 2]);
    indices.push([offset + 0, offset + 2, offset + 3]);
  }
  positions = [].concat.apply([], positions);
  normals = [].concat.apply([], normals);
  texCoords = [].concat.apply([], texCoords);
  indices = [].concat.apply([], indices);

  positions = new Float32Array(positions);
  normals = new Float32Array(normals);
  texCoords = new Float32Array(texCoords);
  indices = new Uint16Array(indices);
  let schema = {
    meshes: {
      0: {
        name: 'box',
        vertices: positions,
        normals: normals,
        texturecoords: [texCoords],
        indices: indices
      }
    }
  }
  return schema;
};

/**
 * @method WebGL.createTorus()
 * @type STATIC
 * this code is taken from http://webglfundamentals.org/
 * @url http://webglfundamentals.org/
 */
WebGL.createTorus = function (
  radius,
  thickness,
  radialSubdivisions,
  bodySubdivisions,
  opt_startAngle,
  opt_endAngle) {
  if (radialSubdivisions < 3) {
    throw Error('radialSubdivisions must be 3 or greater');
  }

  if (bodySubdivisions < 3) {
    throw Error('verticalSubdivisions must be 3 or greater');
  }

  var startAngle = opt_startAngle || 0;
  var endAngle = opt_endAngle || Math.PI * 2;
  var range = endAngle - startAngle;


  var numVertices = (radialSubdivisions) * (bodySubdivisions);
  var positions = [];
  var normals = [];
  var texCoords = [];
  var indices = [];

  for (var slice = 0; slice < bodySubdivisions; ++slice) {
    var v = slice / bodySubdivisions;
    var sliceAngle = v * Math.PI * 2;
    var sliceSin = Math.sin(sliceAngle);
    var ringRadius = radius + sliceSin * thickness;
    var ny = Math.cos(sliceAngle);
    var y = ny * thickness;
    for (var ring = 0; ring < radialSubdivisions; ++ring) {
      var u = ring / radialSubdivisions;
      var ringAngle = startAngle + u * range;
      var xSin = Math.sin(ringAngle);
      var zCos = Math.cos(ringAngle);
      var x = xSin * ringRadius;
      var z = zCos * ringRadius;
      var nx = xSin * sliceSin;
      var nz = zCos * sliceSin;
      positions.push([x, y, z]);
      normals.push([nx, ny, nz]);
      texCoords.push([u, 1 - v]);
    }
  }

  for (var slice = 0; slice < bodySubdivisions; ++slice) {
    for (var ring = 0; ring < radialSubdivisions; ++ring) {
      var nextRingIndex = (1 + ring) % radialSubdivisions;
      var nextSliceIndex = (1 + slice) % bodySubdivisions;
      indices.push([radialSubdivisions * slice + ring,
      radialSubdivisions * nextSliceIndex + ring,
      radialSubdivisions * slice + nextRingIndex]);
      indices.push([radialSubdivisions * nextSliceIndex + ring,
      radialSubdivisions * nextSliceIndex + nextRingIndex,
      radialSubdivisions * slice + nextRingIndex]);
    }
  }

  positions = [].concat.apply([], positions);
  normals = [].concat.apply([], normals);
  texCoords = [].concat.apply([], texCoords);
  indices = [].concat.apply([], indices);

  positions = new Float32Array(positions);
  normals = new Float32Array(normals);
  texCoords = new Float32Array(texCoords);
  indices = new Uint16Array(indices);
  let schema = {
    meshes: {
      0: {
        name: 'torus',
        vertices: positions,
        normals: normals,
        texturecoords: [texCoords],
        indices: indices
      }
    }
  }
  return schema;
};

/**
 * @method WebGL.createTruncatedCone()
 * @type STATIC
 * this code is taken from http://webglfundamentals.org/
 * @url http://webglfundamentals.org/
 */
WebGL.createTruncatedCone = function (
  bottomRadius,
  topRadius,
  height,
  radialSubdivisions,
  verticalSubdivisions,
  opt_topCap,
  opt_bottomCap) {
  if (radialSubdivisions < 3) {
    throw Error('radialSubdivisions must be 3 or greater');
  }

  if (verticalSubdivisions < 1) {
    throw Error('verticalSubdivisions must be 1 or greater');
  }

  var topCap = (opt_topCap === undefined) ? true : opt_topCap;
  var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

  var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

  var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
  var positions = [];
  var normals = [];
  var texCoords = [];
  var indices = [];

  var vertsAroundEdge = radialSubdivisions + 1;

  // The slant of the cone is constant across its surface
  var slant = Math.atan2(bottomRadius - topRadius, height);
  var cosSlant = Math.cos(slant);
  var sinSlant = Math.sin(slant);

  var start = topCap ? -2 : 0;
  var end = verticalSubdivisions + (bottomCap ? 2 : 0);

  for (var yy = start; yy <= end; ++yy) {
    var v = yy / verticalSubdivisions
    var y = height * v;
    var ringRadius;
    if (yy < 0) {
      y = 0;
      v = 1;
      ringRadius = bottomRadius;
    } else if (yy > verticalSubdivisions) {
      y = height;
      v = 1;
      ringRadius = topRadius;
    } else {
      ringRadius = bottomRadius +
        (topRadius - bottomRadius) * (yy / verticalSubdivisions);
    }
    if (yy == -2 || yy == verticalSubdivisions + 2) {
      ringRadius = 0;
      v = 0;
    }
    y -= height / 2;
    for (var ii = 0; ii < vertsAroundEdge; ++ii) {
      var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
      var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
      positions.push([sin * ringRadius, y, cos * ringRadius]);
      normals.push([
        (yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
        (yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
        (yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant)]);
      texCoords.push([(ii / radialSubdivisions), 1 - v]);
    }
  }

  for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {
    for (var ii = 0; ii < radialSubdivisions; ++ii) {
      indices.push([vertsAroundEdge * (yy + 0) + 0 + ii,
      vertsAroundEdge * (yy + 0) + 1 + ii,
      vertsAroundEdge * (yy + 1) + 1 + ii]);
      indices.push([vertsAroundEdge * (yy + 0) + 0 + ii,
      vertsAroundEdge * (yy + 1) + 1 + ii,
      vertsAroundEdge * (yy + 1) + 0 + ii]);
    }
  }

  positions = [].concat.apply([], positions);
  normals = [].concat.apply([], normals);
  texCoords = [].concat.apply([], texCoords);
  indices = [].concat.apply([], indices);

  positions = new Float32Array(positions);
  normals = new Float32Array(normals);
  texCoords = new Float32Array(texCoords);
  indices = new Uint16Array(indices);
  let schema = {
    meshes: {
      0: {
        name: 'cone',
        vertices: positions,
        normals: normals,
        texturecoords: [texCoords],
        indices: indices
      }
    }
  }
  return schema;
};