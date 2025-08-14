/**
 * DEVELOPER: Camilo Ramírez (@jucarave)
 * LICENSE: MIT
 * DESCRIPTION: This is the main game file for the JS13k 2025: 9 Lives to Die game.
 */

/**
 * SECTION CONSTANTS
 * 
 * These are the constant values used throughout the game.
 */
const cr_width = 800,
cr_height = 450,
cr_v_shader = `
  precision mediump float;
  attribute vec3 a_p;
  attribute vec2 a_uv;
  uniform mat4 u_cw, u_cp, u_m;
  varying vec2 v_uv;
  void main() {
    gl_Position = u_cp * u_cw * u_m * vec4(a_p, 1.0);
    v_uv = a_uv;
  }
`, 

cr_f_shader = `
  precision mediump float;
  uniform sampler2D u_tex;
  varying vec2 v_uv;
  void main() {
    gl_FragColor = texture2D(u_tex, v_uv);
  }
`,

cr_Math = Math,
cr_Mathcos = cr_Math.cos,
cr_Mathsin = cr_Math.sin,
cr_document = document,

cr_room = [0, 0, 9, 0, 13, 7, 13, 12, 6, 12, 6, 8, 0, 8, 0, 0], // Room coordinates set by x, y pairs
cr_img = [
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAANpJREFUOI2tkz0OgjAYht8ik2GTpFyAiaWrk0tvoQOH8AAexUFu0UM0JqzONrjqCA7mw68V0ATfpf1++vO8aUWW5h1mKD5uiz4w1kEribKqwfNT9chYB2Od18THsTmN8VDT1MKwLmZ7AAC7IoVW0tuZ4iE/6DZaydcGWkkv+Q2J+o11WCTL1SFp3xSX691bdG4eSNrOy/P5fA+Ij7iNdTjVN8+XEK+s6r4ehVzUxH0ZiwFA7DfrDwS6wZh4/T/vYOg/kDhvKGMdIh4gYA3NoxzPiyzNu195SfyQJ39emVAdUBVcAAAAAElFTkSuQmCC'
];

/**
 * SECTION VARIABLES
 * 
 * This section contains the global variables used in the game.
 */
let cr_canvas,      // HTMLCanvasElement
  cr_gl,            // WebGLRenderingContext
  cr_program,       // WebGLProgram

  cr_keys = {},     // Object to store key states

  cr_getUniformLocation = null, // Function to get uniform locations
  cr_uniformMatrix4fv = null,   // Function to set uniform matrices

  cr_cameraPosition = [-3,-0.5, -3],       // Camera position in 3D space
  cr_cameraRotation = 0,                  // Camera rotation angle in radians
  cr_cameraView = cr_updateMatrix(cr_cameraPosition, cr_cameraRotation),     // Camera view matrix         
  cr_cameraProjection  = [1, 0, 0, 0, // Camera projection matrix
                          0, 1.778, 0, 0, 
                          0, 0, -1, -1, 
                          0, 0, -0.1, 0],
  
  cr_identityMatrix = cr_matTranslate(), // Static identity matrix for transformations
  cr_geometries = { cr_room: {} },       // Object to hold geometries for different objects in the game
  cr_textures = [];

/**
 * SECTION UTILITY FUNCTIONS
 */
function cr_matTranslate(X=0, Y=0, Z=0) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    X, Y, Z, 1
  ];
}

// Helper function for matrix multiplication
function cr_vector4Dot(A, B) {
  return A[0]*B[0]+A[1]*B[1]+A[2]*B[2]+A[3]*B[3];
}

// I wanted to avoid matrix multiplication in the game code, but it seems unavoidable.
function cr_matMultiply(A, B) {
  let cr_matriz = [], R, C, I, J;
  for (I=0;I<16;I+=4) {
    R = [A[I], A[I+1], A[I+2], A[I+3]];
    for (J=0;J<4;J++) {
      C = [B[J], B[J+4], B[J+8], B[J+12]];
      cr_matriz[I+J] = cr_vector4Dot(R, C);
    }
  }
  
  return cr_matriz;
}

function cr_updateMatrix(cr_position, cr_rotation, cr_transMat = true) {
  const cr_cos = cr_Mathcos(cr_rotation),
  cr_sin = cr_Mathsin(cr_rotation),
  
  // Let's multiply the rotation and translation matrices
  cr_rot = [
      cr_cos, 0, cr_sin, 0,
      0, 1, 0, 0,
      -cr_sin, 0, cr_cos, 0,
      0, 0, 0, 1
    ],
  cr_trans = cr_matTranslate(cr_position[0], cr_position[1], cr_position[2]);

  return cr_transMat ? 
    cr_matMultiply(cr_trans, cr_rot) : 
    cr_matMultiply(cr_rot, cr_trans);
}

/**
 * SECTION CAMERA FUNCTIONS
 */
function cr_updateCamera() {
  // Update camera rotation based on input
  const R = 0.05,
  T = cr_keys["ArrowLeft"] ? 1 : cr_keys["ArrowRight"] ? -1 : 0;
  cr_cameraRotation += T * R;

  // Update camera position based on input
  const C = cr_Mathcos(cr_cameraRotation),
  S = cr_Mathsin(cr_cameraRotation),
  V = 0.1,            // Velocity
  L = V + 0.5,        // Lookahead distance
  M = (cr_keys["ArrowUp"] ? 1 : cr_keys["ArrowDown"] ? -1 : 0);

  if (M != 0 && !cr_doesCollidesWithWalls(cr_cameraPosition, M * S * L, M * C * L)) {
    cr_cameraPosition[0] += M * S * V;
    cr_cameraPosition[2] += M * C * V;
  }

  // If there was any movement, update the camera view matrix
  (M || T) && (cr_cameraView = cr_updateMatrix(cr_cameraPosition, cr_cameraRotation));
}

/**
 * SECTION ENGINE FUNCTIONS
 */
function cr_initEngine() {
  // Get the canvas element and set its dimensions
  cr_canvas = cr_document.getElementById("cg");
  cr_canvas.width = cr_width;
  cr_canvas.height = cr_height;

  // Get the WebGL context
  cr_gl = cr_canvas.getContext("webgl");
  cr_gl.clearColor(0, 0, 0, 1);
  cr_gl.enable(2929);   // Enable depth testing 
  cr_gl.enable(2884);   // Enable culling
  cr_gl.depthFunc(515); // Set the depth function to gl.LEQUAL
  cr_gl.viewport(0, 0, cr_width, cr_height);

  cr_getUniformLocation = cr_gl.getUniformLocation.bind(cr_gl);
  cr_uniformMatrix4fv = cr_gl.uniformMatrix4fv.bind(cr_gl);

  // Load and compile the shader
  const cr_shaders = [];
  cr_program = cr_gl.createProgram();
  for (let I=0;I<2;I++) {
    cr_shaders[I] = cr_gl.createShader(35633 - I);    // 35633 is for Vertex Shader, 35632 for Fragment Shader
    cr_gl.shaderSource(cr_shaders[I], I ? cr_f_shader : cr_v_shader);
    cr_gl.compileShader(cr_shaders[I]);  
    cr_gl.attachShader(cr_program, cr_shaders[I]);
    if (!cr_gl.getShaderParameter(cr_shaders[I], 35713)) { // 35713 is for COMPILE_STATUS
      const cr_info = cr_gl.getShaderInfoLog(cr_shaders[I]);
      console.error("Error compiling shader:", cr_info);
    }
  }
  cr_gl.linkProgram(cr_program);
  cr_gl.useProgram(cr_program);

  // Init the input
  cr_document.addEventListener("keydown", (cr_event) => 
    cr_keys[cr_event.code] = 1
  );
  cr_document.addEventListener("keyup", (cr_event) => 
    cr_keys[cr_event.code] = 0
  );
}

function cr_loadTextures() {
  for (let i=0;i<1;i++){
    cr_textures[i] = cr_gl.createTexture();
    const cr_image = new Image();
    const A = 3553;
    cr_image.src = cr_img[i];
    cr_image.onload = () => {
      cr_gl.bindTexture(A, cr_textures[i]);
      cr_gl.texImage2D(A, 0, 6408, 6408, 5121, cr_image);
      cr_gl.texParameteri(A, 10240, 9728);
      cr_gl.texParameteri(A, 10241, 9728);
    };
  }
}

/**
 * SECTION PHYSICS
 */
function cr_linesIntersect(...A) {
  const D = (A[2] - A[0]) * (A[7] - A[5]) - (A[3] - A[1]) * (A[6] - A[4]);
  if (D === 0) return 0;
  
  const T = ((A[4] - A[0]) * (A[7] - A[5]) - (A[5] - A[1]) * (A[6] - A[4])) / D,
  U = ((A[4] - A[0]) * (A[3] - A[1]) - (A[5] - A[1]) * (A[2] - A[0])) / D;

  return T >= 0 && T <= 1 && U >= 0 && U <= 1;
}

function cr_doesCollidesWithWalls(P, X, Y) {
  for (let I = 0; I < cr_room.length; I+=2) {
    if (cr_linesIntersect(-P[0], -P[2], -P[0] - X, -P[2] - Y, ...cr_room.slice(I, I+4))) return 1;
  }

  return 0;
}

/**
 * SECTION GEOMETRY FUNCTIONS
 */
function cr_renderGeometry(cr_geometry, cr_worldMatrix) {
  cr_gl.bindBuffer(34962, cr_geometry.cr_vertexBuffer); // 34962 is for ARRAY_BUFFER
  cr_gl.bindBuffer(34963, cr_geometry.cr_indexBuffer);  // 34963 is for ELEMENT_ARRAY_BUFFER

  const cr_positionLocation = cr_gl.getAttribLocation(cr_program, "a_p"),
  cr_uvLocation = cr_gl.getAttribLocation(cr_program, "a_uv");
  cr_gl.enableVertexAttribArray(cr_positionLocation);
  cr_gl.enableVertexAttribArray(cr_uvLocation);
  cr_gl.vertexAttribPointer(cr_positionLocation, 3, 5126, 0, 20, 0);  // 5126 is for FLOAT, 20 is stride (5 floats * 4 bytes each)
  cr_gl.vertexAttribPointer(cr_uvLocation, 2, 5126, 0, 20, 12); // 5126 is for FLOAT, 20 is stride (5 floats * 4 bytes each), 12 is the offset

  // Set the camera view, projection matrices and model matrix
  const cr_cameraViewLocation = cr_getUniformLocation(cr_program, "u_cw"),
  cr_cameraProjectionLocation = cr_getUniformLocation(cr_program, "u_cp"),
  cr_quadModelLocation = cr_getUniformLocation(cr_program, "u_m");
  cr_uniformMatrix4fv(cr_cameraViewLocation, 0, cr_cameraView);
  cr_uniformMatrix4fv(cr_cameraProjectionLocation, 0, cr_cameraProjection);
  cr_uniformMatrix4fv(cr_quadModelLocation, 0, cr_worldMatrix);

  // Send the texture
  const cr_textureLocation = cr_getUniformLocation(cr_program, "u_tex");
  cr_gl.activeTexture(33984); // 33984 is for TEXTURE0
  cr_gl.bindTexture(3553, cr_textures[0]);
  cr_gl.uniform1i(cr_textureLocation, 0);

  cr_gl.drawElements(4, cr_geometry.cr_indices.length, 5123, 0); // 4 is for TRIANGLES, 6 is the number of indices, 5123 is for UNSIGNED_SHORT
}

function cr_buildRoomGeometry(cr_geometry, cr_room) {
  cr_geometry.cr_vertices = [];
  cr_geometry.cr_indices = [];
  let cr_indexOffset = 0, I, X1, X2, Y1, Y2, TX, TY;
  for (I=0;I<cr_room.length-2;I+=2) {
    X1 = cr_room[I], Y1 = cr_room[I+1];
    X2 = cr_room[I+2], Y2 = cr_room[I+3];
    TX = cr_Math.sqrt((X2 - X1) ** 2 + (Y2 - Y1) ** 2);
    TY = 1;

    // Add two triangles for each rectangle defined by the coordinates
    cr_geometry.cr_vertices.push(
      X1, 0, Y1,  0, TY,
      X2, 0, Y2, TX, TY,
      X1, 1, Y1,  0, 0,
      X2, 1, Y2, TX, 0
    );

    cr_geometry.cr_indices.push(
      cr_indexOffset + 0, cr_indexOffset + 1, cr_indexOffset + 2,
      cr_indexOffset + 2, cr_indexOffset + 1, cr_indexOffset + 3
    );
    cr_indexOffset += 4;
  }

  cr_geometry.cr_vertexBuffer = cr_gl.createBuffer();
  cr_gl.bindBuffer(34962, cr_geometry.cr_vertexBuffer); // 34962 is for ARRAY_BUFFER
  cr_gl.bufferData(34962, new Float32Array(cr_geometry.cr_vertices), 35044); // 35044 is for STATIC_DRAW

  cr_geometry.cr_indexBuffer = cr_gl.createBuffer();
  cr_gl.bindBuffer(34963, cr_geometry.cr_indexBuffer);  // 34963 is for ELEMENT_ARRAY_BUFFER
  cr_gl.bufferData(34963, new Uint16Array(cr_geometry.cr_indices), 35044);   // 35044 is for STATIC_DRAW
}

/**
 * SECTION GAME LOOP
 */
function cr_update() {
  cr_gl.clear(16640); // 16640 is for COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT

  cr_updateCamera();
  cr_renderGeometry(cr_geometries.cr_room, cr_identityMatrix);

  requestAnimationFrame(cr_update);
}

/**
 * SECTION MAIN FUNCTION
 * 
 * This is the main function that initializes the engine and starts the game.
 */
function cr_main() {
  cr_initEngine();
  cr_loadTextures();
  cr_buildRoomGeometry(cr_geometries.cr_room, cr_room);
  cr_update();
}

cr_main();