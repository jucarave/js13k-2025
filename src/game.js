/**
 * SECTION CONSTANTS
 * 
 * These are the constant values used throughout the game.
 */
const cr_width = 800,
cr_height = 450,
cr_v_shader = `
  attribute vec3 a_p;
  uniform mat4 u_cw;
  uniform mat4 u_cp;
  uniform mat4 u_m;
  void main() {
    gl_Position = u_cp * u_cw * u_m * vec4(a_p, 1.0);
  }
`, 

cr_f_shader = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`,

cr_Math = Math;

/**
 * SECTION VARIABLES
 * 
 * This section contains the global variables used in the game.
 */
let cr_canvas,      // HTMLCanvasElement
  cr_gl,            // WebGLRenderingContext
  cr_program,       // WebGLProgram

  cr_cameraPosition = [0,0, -3], // Camera position in 3D space
  cr_cameraRotation = 0,         // Camera rotation angle in radians
  cr_cameraView  = cr_matIdentity(), // Camera view matrix         
  cr_cameraProjection  = [1.732, 0, 0, 0, // Camera projection matrix
                          0, 3.079, 0, 0, 
                          0, 0, -1, -1, 
                          0, 0, -0.1, 0],
  
  cr_quadVertexBuffer = null, // Vertex Buffer Object for quad
  cr_quadIndexBuffer = null,  // Index Buffer Object for quad
  cr_quadRotation = 0,
  cr_quadMatriz = cr_matIdentity();

/**
 * SECTION UTILITY FUNCTIONS
 */
function cr_matIdentity() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

function cr_updateMatrix(cr_position, cr_rotation) {
  const cr_cos = cr_Math.cos(cr_rotation);
  const cr_sin = cr_Math.sin(cr_rotation);
  return [
    cr_cos, 0, cr_sin, 0,
    0, 1, 0, 0,
    -cr_sin, 0, cr_cos, 0,
    cr_position[0], cr_position[1], cr_position[2], 1
  ];
}

/**
 * SECTION CAMERA FUNCTIONS
 */
function cr_setCameraView() {
  // Set the camera view matrix based on the current position and rotation
  cr_cameraView = cr_updateMatrix(cr_cameraPosition, cr_cameraRotation);
}

/**
 * SECTION ENGINE FUNCTIONS
 */
function cr_initEngine() {
  // Get the canvas element and set its dimensions
  cr_canvas = document.getElementById("cg");
  cr_canvas.width = cr_width;
  cr_canvas.height = cr_height;

  // Get the WebGL context
  cr_gl = cr_canvas.getContext("webgl");
  cr_gl.clearColor(0.0, 0.0, 0.0, 1.0);
  cr_gl.enable(2929);
  cr_gl.depthFunc(515);
  cr_gl.viewport(0, 0, cr_width, cr_height);

  // Load and compile the shader
  const cr_vertexShader = cr_gl.createShader(35633);
  cr_gl.shaderSource(cr_vertexShader, cr_v_shader);
  cr_gl.compileShader(cr_vertexShader);
  
  const cr_fragmentShader = cr_gl.createShader(35632);
  cr_gl.shaderSource(cr_fragmentShader, cr_f_shader);
  cr_gl.compileShader(cr_fragmentShader);

  cr_program = cr_gl.createProgram();
  cr_gl.attachShader(cr_program, cr_vertexShader);
  cr_gl.attachShader(cr_program, cr_fragmentShader);
  cr_gl.linkProgram(cr_program);

  cr_gl.useProgram(cr_program);
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
  cr_gl.bindBuffer(34962, cr_quadVertexBuffer);
  cr_gl.bufferData(34962, cr_positions, 35044);

  cr_quadIndexBuffer = cr_gl.createBuffer();
  cr_gl.bindBuffer(34963, cr_quadIndexBuffer);
  cr_gl.bufferData(34963, cr_indices, 35044);
}

function cr_renderQuad() {
  cr_gl.bindBuffer(34962, cr_quadVertexBuffer);
  cr_gl.bindBuffer(34963, cr_quadIndexBuffer);

  const cr_positionLocation = cr_gl.getAttribLocation(cr_program, "a_p");
  cr_gl.enableVertexAttribArray(cr_positionLocation);
  cr_gl.vertexAttribPointer(cr_positionLocation, 3, cr_gl.FLOAT, false, 3 * 4, 0);

  // Set the camera view and projection matrices
  const cr_cameraViewLocation = cr_gl.getUniformLocation(cr_program, "u_cw");
  const cr_cameraProjectionLocation = cr_gl.getUniformLocation(cr_program, "u_cp");
  cr_gl.uniformMatrix4fv(cr_cameraViewLocation, false, cr_cameraView);
  cr_gl.uniformMatrix4fv(cr_cameraProjectionLocation, false, cr_cameraProjection);

  // Update quad rotation matrix
  const cr_quadModelLocation = cr_gl.getUniformLocation(cr_program, "u_m");
  cr_gl.uniformMatrix4fv(cr_quadModelLocation, false, cr_quadMatriz);

  cr_gl.drawArrays(cr_gl.TRIANGLE_STRIP, 0, 4);
}

/**
 * SECTION GAME LOOP
 */
function cr_updateQuad() {
  cr_quadRotation += 0.03;
  cr_quadMatriz = cr_updateMatrix([0,0,0], cr_quadRotation);
}

function cr_update() {
  cr_gl.clear(cr_gl.COLOR_BUFFER_BIT | cr_gl.DEPTH_BUFFER_BIT);

  cr_setCameraView();
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