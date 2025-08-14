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
  attribute vec3 a_p;
  uniform mat4 u_cw, u_cp, u_m;
  void main() {
    gl_Position = u_cp * u_cw * u_m * vec4(a_p, 1.0);
  }
`, 

cr_f_shader = `
  void main() {
    gl_FragColor = vec4(1.0);
  }
`,

cr_true = true,
cr_false = false,
cr_Math = Math,
cr_Mathcos = cr_Math.cos,
cr_Mathsin = cr_Math.sin,
cr_document = document;

/**
 * SECTION VARIABLES
 * 
 * This section contains the global variables used in the game.
 */
let cr_canvas,      // HTMLCanvasElement
  cr_gl,            // WebGLRenderingContext
  cr_program,       // WebGLProgram

  cr_keys = {},     // Object to store key states

  cr_cameraPosition = [0,0, -3],          // Camera position in 3D space
  cr_cameraRotation = 0,                  // Camera rotation angle in radians
  cr_cameraView  = cr_matTranslate(),     // Camera view matrix         
  cr_cameraProjection  = [1.732, 0, 0, 0, // Camera projection matrix
                          0, 3.079, 0, 0, 
                          0, 0, -1, -1, 
                          0, 0, -0.1, 0],
  
  cr_quadVertexBuffer = null, // Vertex Buffer Object for quad
  cr_quadIndexBuffer = null,  // Index Buffer Object for quad
  cr_quadRotation = 0,
  cr_quadMatriz = cr_matTranslate();

/**
 * SECTION UTILITY FUNCTIONS
 */
function cr_matTranslate(x=0, y=0, z=0) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  ];
}

// Helper function for matrix multiplication
function cr_vector4Dot(A, B) {
  return A[0]*B[0]+A[1]*B[1]+A[2]*B[2]+A[3]*B[3];
}

// I wanted to avoid matrix multiplication in the game code, but it seems unavoidable.
function cr_matMultiply(A, B) {
  const cr_matriz = [];
  for (let i=0;i<16;i+=4) {
    const R = [A[i], A[i+1], A[i+2], A[i+3]];
    for (let j=0;j<4;j++) {
      const C = [B[j], B[j+4], B[j+8], B[j+12]];
      cr_matriz[i+j] = cr_vector4Dot(R, C);
    }
  }
  
  return cr_matriz;
}

function cr_updateMatrix(cr_position, cr_rotation) {
  const cr_cos = cr_Mathcos(cr_rotation);
  const cr_sin = cr_Mathsin(cr_rotation);
  
  // Let's multiply the rotation and translation matrices
  return cr_matMultiply(
    cr_matTranslate(cr_position[0], cr_position[1], cr_position[2]),
    [
      cr_cos, 0, cr_sin, 0,
      0, 1, 0, 0,
      -cr_sin, 0, cr_cos, 0,
      0, 0, 0, 1
    ]
  );
}

/**
 * SECTION CAMERA FUNCTIONS
 */
function cr_updateCamera() {
  // Update camera rotation based on input
  const r = 0.05;
  cr_cameraRotation += cr_keys["ArrowLeft"] ? r : cr_keys["ArrowRight"] ? -r : 0;

  // Update camera position based on input
  const c = cr_Mathcos(cr_cameraRotation);
  const s = cr_Mathsin(cr_cameraRotation);
  const v = 0.1;
  const m = (cr_keys["ArrowUp"] ? 1 : cr_keys["ArrowDown"] ? -1 : 0);
  cr_cameraPosition[0] += m * s * v;
  cr_cameraPosition[2] += m * c * v;

  cr_cameraView = cr_updateMatrix(cr_cameraPosition, cr_cameraRotation);
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
  cr_gl.depthFunc(515); // Set the depth function to gl.LEQUAL
  cr_gl.viewport(0, 0, cr_width, cr_height);

  // Load and compile the shader
  const cr_shaders = [];
  cr_program = cr_gl.createProgram();
  for (let i=0;i<2;i++) {
    cr_shaders[i] = cr_gl.createShader(35633 - i);    // 35633 is for Vertex Shader, 35632 for Fragment Shader
    cr_gl.shaderSource(cr_shaders[i], i ? cr_f_shader : cr_v_shader);
    cr_gl.compileShader(cr_shaders[i]);  
    cr_gl.attachShader(cr_program, cr_shaders[i]);
  }
  cr_gl.linkProgram(cr_program);
  cr_gl.useProgram(cr_program);

  // Init the input
  cr_document.addEventListener("keydown", (cr_event) => 
    cr_keys[cr_event.code] = cr_true
  );
  cr_document.addEventListener("keyup", (cr_event) => 
    cr_keys[cr_event.code] = cr_false
  );
}

function cr_createQuad() {
  const cr_positions = new Float32Array([
    -0.5, -0.5, 0,
     0.5, -0.5, 0,
    -0.5,  0.5, 0,
     0.5,  0.5, 0
  ]);
  const cr_indices = new Uint16Array([
    0, 1, 2,
    2, 1, 3
  ]);

  cr_quadVertexBuffer = cr_gl.createBuffer();
  cr_gl.bindBuffer(34962, cr_quadVertexBuffer); // 34962 is for ARRAY_BUFFER
  cr_gl.bufferData(34962, cr_positions, 35044); // 35044 is for STATIC_DRAW

  cr_quadIndexBuffer = cr_gl.createBuffer();
  cr_gl.bindBuffer(34963, cr_quadIndexBuffer);  // 34963 is for ELEMENT_ARRAY_BUFFER
  cr_gl.bufferData(34963, cr_indices, 35044);   // 35044 is for STATIC_DRAW
}

function cr_renderQuad() {
  cr_gl.bindBuffer(34962, cr_quadVertexBuffer); // 34962 is for ARRAY_BUFFER
  cr_gl.bindBuffer(34963, cr_quadIndexBuffer);  // 34963 is for ELEMENT_ARRAY_BUFFER

  const cr_positionLocation = cr_gl.getAttribLocation(cr_program, "a_p");
  cr_gl.enableVertexAttribArray(cr_positionLocation);
  cr_gl.vertexAttribPointer(cr_positionLocation, 3, 5126, cr_false, 12, 0); // 5126 is for FLOAT, 12 is stride (3 floats * 4 bytes each)

  // Set the camera view and projection matrices
  const cr_cameraViewLocation = cr_gl.getUniformLocation(cr_program, "u_cw");
  const cr_cameraProjectionLocation = cr_gl.getUniformLocation(cr_program, "u_cp");
  cr_gl.uniformMatrix4fv(cr_cameraViewLocation, cr_false, cr_cameraView);
  cr_gl.uniformMatrix4fv(cr_cameraProjectionLocation, cr_false, cr_cameraProjection);

  // Update quad rotation matrix
  const cr_quadModelLocation = cr_gl.getUniformLocation(cr_program, "u_m");
  cr_gl.uniformMatrix4fv(cr_quadModelLocation, cr_false, cr_quadMatriz);

  cr_gl.drawElements(4, 6, 5123, 0); // 4 is for TRIANGLES, 6 is the number of indices, 5123 is for UNSIGNED_SHORT
}

/**
 * SECTION GAME LOOP
 */
function cr_updateQuad() {
  cr_quadRotation += 0.03;
  cr_quadMatriz = cr_updateMatrix([0,0,0], cr_quadRotation);
}

function cr_update() {
  cr_gl.clear(16640); // 16640 is for COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT

  cr_updateCamera();
  cr_updateQuad();
  cr_renderQuad();

  requestAnimationFrame(cr_update);
}

/**
 * SECTION MAIN FUNCTION
 * 
 * This is the main function that initializes the engine and starts the game.
 */
function cr_main() {
  cr_initEngine();
  cr_createQuad();
  cr_update();
}

cr_main();