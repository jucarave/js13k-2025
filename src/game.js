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
  vec4 c = texture2D(u_tex, v_uv);
  if (c.a == 0.0) discard;
  gl_FragColor = c;
}
`,

cr_Math = Math,
cr_Mathcos = cr_Math.cos,
cr_Mathsin = cr_Math.sin,
cr_Mathabs = cr_Math.abs,
cr_pi = cr_Math.PI,
cr_pi_2 = cr_Math.PI / 2,
cr_document = document,

cr_gravity = 0.01,
cr_spriteSpeed = 0.1,
cr_e1m1Walls = [ // Room coordinates set by x, y pairs, first three numbers are y1, y2, textureId
  [0, 2, 0, 0, 0, 9, 0, 13, 7, 13, 12, 6, 12, 6, 8, 0, 8, 0, 0],
  [0, 0.2, 0, 4, 3, 7, 3, 7, 6, 4, 6, 4, 3],
  [0, 0.4, 0, 5, 4, 6, 4, 6, 5, 5, 5, 5, 4],
  [0, 1, 0, 12, 7, 13, 7, 13, 9, 12, 9, 12, 7]
], 
cr_e1m1Planes = [               // Planes coordinates set by y, textureId, x1, z1, x2, z2
  // Floors
  0, 1, 0, 0, 14, 13,
  0.2, 1, 4, 3, 7, 6,
  0.4, 1, 5, 4, 6, 5,
  1, 1, 12, 7, 13, 9,

  // Ceilings
  2, 2, 0, 0, 14, 13
],
cr_e1m1FloorsCount = 4*6,
cr_smallUvs = [
  [0,0,1/8,1],
  [1/8,0,2/8,1],
  [2/8,0,3/8,1],
  [3/8,0,4/8,1],
  [4/8,0,5/8,1],
  [5/8,0,6/8,1],
  [6/8,0,7/8,1],
  [7/8,0,8/8,1]
],
cr_img = [
  // Wall
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAANpJREFUOI2tkz0OgjAYht8ik2GTpFyAiaWrk0tvoQOH8AAexUFu0UM0JqzONrjqCA7mw68V0ATfpf1++vO8aUWW5h1mKD5uiz4w1kEribKqwfNT9chYB2Od18THsTmN8VDT1MKwLmZ7AAC7IoVW0tuZ4iE/6DZaydcGWkkv+Q2J+o11WCTL1SFp3xSX691bdG4eSNrOy/P5fA+Ij7iNdTjVN8+XEK+s6r4ehVzUxH0ZiwFA7DfrDwS6wZh4/T/vYOg/kDhvKGMdIh4gYA3NoxzPiyzNu195SfyQJ39emVAdUBVcAAAAAElFTkSuQmCC',
  // Floor
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAALNJREFUOI1jjMrs+M+ABh7cvsdw78J+dGEGJQNHBgVVJRQxFgxVDAwM9y7sZyhu78cQ760sJGzAvtVzGYrb+xnOn7uCYYBTaDLDvtVzGZxCk+FiTMRqRjcEwwBiNGMzhIlUzeiGMEqIqP4nVTMyYGJgYCBbMwN6IA5RA5QMHFHilRSwb/VcBiYFVSUGcgzZt3oug5KBI8QLpBoC06ygqoQIA2INQdbMgB6IhAxB18zAwMAAACcOVy5PY3YrAAAAAElFTkSuQmCC',
  // Ceiling
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAIVJREFUOI21U7ENwCAMA27IkjVDF97o/yewsvBDOyFoEqNWqJmQ5Vi2gXjk8wobkzRALIbkYQ+BmdBqMaQZ02IJLaEFzTURkCMUI+6USCzDwZfyOt5qGQJeUai8Gd+KEFCJyDIU6ARE9G6in/+LsLL9SsB7nZ6o+QurJS1KLLYDYln+DT03Q44yZR0Yw90AAAAASUVORK5CYII=',
  // Broom
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAQCAYAAADeWHeIAAAAAXNSR0IArs4c6QAAA25JREFUaIHVWb1q40AQ/nRcHQdOhVCTSkm1EIIbEzcBc29w7lL4DOnV+gHSqg+4SuciDxAMaQRpQgioSgQHgeCoUCDOA1hXWLO3kiV5dyXHuQ+Mjdbf7Pzu7NgGSmCZTgIAURwaZd+p4ulwm9SjaXwVPZrG96KHlukks4sW0GGwGRJZo0UeACVuqbygC9wGsM+cWrLqgNsFbFUPWYhFSCjTudSQbBL40pm/mgTy3BU5PPhz7ZOoqWBxfWrYpLOnyj5ks+h/ANyHUPWHZTrJ4qqdLF4HSVFWNc3L8F8HyeKqrc1/Oe4lL8e9xDIdLRlVejUlb+1eCvaLPl+8DhIR9KxI929VQqM4NChzVMB5t4EyV4Ru5d8d7OH6bY7rtznOzV3cHewVHotfHmkVK+me+jyJfvNXfk1E4R2gTOinQmNPMfij+D2zdnewhzb07yTU2mzm69A3jmXRUQsIpFuAXAJ0GAANw3V5GlzLdJJzc5cHXzR0hKVjZJMg33vFSyC2MAnMLlpSl09aXyaCX7iWR2UL+B+RDz5S40fxO67f5mvbQX6NX/46TKslbQOkI11aq3TebAuo0zoUuVEcGiOUVwmtV8koGveiODRshu38BpD6QDvxJHxYeQLkRzpV6FwgOToMs4uW0gWoyknUIn7+aJV9hV9e83pTIkjr3hC0RrcCfhUKEyA/OunOvbOgi4nbU76BL6vuXw+rM8rlue3H57W2iHo3OUbKggpvFnSVi0CVv5IAlukkE7cHpI7QqWKSYTMf+0dMKwmQZjD1MR0Zlukk4+4QSC+A+cmgdF/mo+9N8XDpYuL2tPXXAffd2Rw282GfzZX2V+V/KyJT0Gzmg5JBB3W4xCcdVBOJgn/ifGDcHaL9+AxKBpl9J24PT/cB9o8Yf/aZJwEl38Olu1H+ygmwf8TwdB9wIbogx9UF6SAGQxYnzgduwh0AwJ/BL2ke7ZN/l0kCsW1UvZQM2SAysy5VLBn8dB+g7021fo2jqqXA6cgS5ZA+ANbKEY/+E+cDAHAT7mDoj6X2z/uCbDg89Ur5FNSHSzeTrCIXNJqV/L9R5jdZ/+nw+QkQxaHR96aZE0An+KKsvBKqxyjJgeBIGZ2iODSG/jhzAsgGP7/v4amHvjetDD5hFnRxeOplfEifqa3YzK+cqsqCJ3v6qfL/AjiZ9HvKw9auAAAAAElFTkSuQmCC',
  // Projectile
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAGVJREFUGJWFj7ENgDAQA+9RKkSfJcI0jME8GYNpYAi+J7SmQEGkQFxlyX7Lb1SyizdzNIBQzTQNjb/hukPZlfYiSUp7aTTZFerF6Cdr7B9d6fjhCayxZ/SzaQKwz5HLAXM0+3vzAjWqNnUS9G+2AAAAAElFTkSuQmCC'
],
cr_img_clamp_to_edges = [0,0,0,1],
cr_newImage = (cr_src) => {
  const img = new Image();
  img.src = cr_src;
  return img;
},
cr_img_2d = [
  cr_newImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAWCAYAAADAQbwGAAAAAXNSR0IArs4c6QAAAWxJREFUOI21lLFKxEAQhv/oteGE2yLdNYYI1+Z6q4N7A0FB8THyAD6GXCCCb3AgFvZ3hU3AEBu7CCucpD7W4phlstlko+DfJJmZ/TK7MzseHApEqOi9kqXnih+5QNtoqm0xoFxgqyMQoboTJ1hMxnj6+sZiMm744+KjE9oyEszUUGjD0AXrAtug+sOEpdijkDUAgOx0BBxsQr0+WCR8AEAha3C/CebQI3NLPDN6RsJHir2OIRhlyNVoG77oaiaQ5VJDASAx/27RiLbLMzO1upxZ7TcPOfs5VCVLT2dYyBqVLL1AhCoSPrJc6oXPr5+9WWW5xDaaIgaUBh4KcLgd1zhGygrC4aboJtG5tqqcyB3AWmWoErlDJUuv0Ydg95QPhSGidb3TYyi01dg2vWzeFQBcLJe9sMf1GgBwPj/9pwxdA5T8ZpGoeK3hYGZhg96fza2Z3r5t2uPLBXRtu3d8mQF/OcPWtCHIb/qQx/4AO5LLlQv68q4AAAAASUVORK5CYII='),
  cr_newImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAbCAYAAABvCO8sAAAAAXNSR0IArs4c6QAAAYtJREFUSIndlr9uwjAQxr9UWSMq4YGNBZSBNexMSLxBpXboc+QB+hxFSqW+ARLqwA5DlwxRWLqlkpGCmFE6nWsc23GAMvRbEt2d73fnf4kHR/XYsKL3guee6zhVvitoE/aFLQKqc8HWAT02rF7YPabdDpa7Pabdzok/yr5aQ43BBFN1KVQbaIKZwG2gtSAVNscRGT8AAMhOUyyDXaEnASZYyAIAQMYPkP0q2AV6Z3LIndEzZAHmOIoYglGHLtIeCznp04ghSbmAAkDslLoBSNMpd6bq9XGktT+/pVJxqGzTWuuQ1inmJUIWIEm58H18flurT1KOTdhHhF/oar2tJuOBKEAYH2azWgLqGNI6mkQ30XK3R8xLFDz35OvwfbHAZDzwPCj3pA7aRjoYqeC555u6o4AY5mJMY0y+1XpbCaepIpPPBrPl8mWDS2J1imNeOhcC28HXVapbT9XWVLT2LtVV2JTItlFaAy9RI/CaUN2OtX6Arw1D06b5CzX+05yT1Hb4b97h/wfefJf+AA4t52LL4ljBAAAAAElFTkSuQmCC'),
  cr_newImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAYCAYAAADtaU2/AAAAAXNSR0IArs4c6QAAAeZJREFUSImtlq1vwkAYxh+2OiAjWQWusqKVBIWYWoLGLIFk/AnTGFLD38ESSGbQJAsCUbVUIFqBnCtJl7AActkM7+3uev2ER7W9j9897/veXSvIkB2efuVvfrNayRqXJS0L6C+OqYspuwgl2A5PvwRsjjuxdh+u2LcEPAYmKAE904gNanGL8eEq4XKK5PZYZ4JO9AYe7+8yV97afiJ0XNi9GgPwEWNz92oCnD3wUM808P71nQkljaI9Qsf9ByyOWLcPeOp2AQBvyyUePuoCvKJyWgQoixYg1wZFhcA3uSkp0IGlwzMNeKahLEYAWLcP8BdHlnstze0rfoT3bXRgz9O+heE8AADMgggvZjU1PXKoE/cxOTL1OoNO+xZrX212GFg6ZkHEaoLPNS85zIlg3im5JOhqs2MuAWCiNwQoFVeWEh3jnDsCDOeB8E5pURVYHinB5JIgpFkQpQKb445wqhUGT/RGLMfPuE0EllEMPIr2zFXouMC52lVAeRdQn6QtlQgmKA8JHRcjxUQ8lO+fBwoAGjtb4bJBPNzu1Vje+HYZWFQa+IMdanfsAjgv7hp5ZqHm4ZBCRhtfjswlil3g/J8Hf9rI93RRyadXrKoF0BX+rZKUa+JL3ZJ416WvxUuV6fhabknk+g9WxEHCe7GpzwAAAABJRU5ErkJggg==')
];

/**
 * SECTION VARIABLES
 * 
 * This section contains the global variables used in the game.
 */
let cr_canvas,      // HTMLCanvasElement
  cr_gl,            // WebGLRenderingContext
  cr_program,       // WebGLProgram

  cr_canvas2D,      // HTMLCanvasElement for 2D rendering
  cr_ctx2D,         // 2D rendering context

  cr_keys = {},     // Object to store key states

  cr_getUniformLocation = null, // Function to get uniform locations
  cr_uniformMatrix4fv = null,   // Function to set uniform matrices

  cr_cameraPosition = [3,0,3,0],       // Camera position in 3D space + vertical speed
  cr_cameraRotation = 0,             // Camera rotation angle in radians
  cr_cameraView = cr_updateMatrix(cr_cameraPosition, cr_cameraRotation),     // Camera view matrix
  cr_cameraProjection  = [1, 0, 0, 0, // Camera projection matrix
                          0, 1.778, 0, 0, 
                          0, 0, -1, -1, 
                          0, 0, -0.1, 0],
  cr_cameraTargetFloor = 0,       // Where should the camera be placed at vertically?
  cr_cameraIsJumping = 0,         // Is the camera jumping
  cr_cameraAttackDelay = 0,       // Delay between attacks
  cr_cameraHealth = 5,            // Player's health
  cr_cameraState = 0,             // 0: Alive, 1: Dead

  cr_catBobbing = 0,

  cr_enemies = [],                      // Array to hold enemy objects
  cr_projectiles = [],                  // Array to hold projectile objects

  cr_identityMatrix = cr_matTranslate(), // Static identity matrix for transformations
  cr_geometries = [],       // Object to hold geometries for different objects in the game
  cr_textures = [],
  
  cr_walls = cr_e1m1Walls,
  cr_planes = cr_e1m1Planes,
  cr_floorsCount = cr_e1m1FloorsCount;

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

function cr_updateMatrix(cr_position, cr_rotation, cr_transMat = 1) {
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
  if (cr_cameraState === 1) return;
  
  // Update camera rotation based on input
  const R = 0.05,
  T = cr_keys["ArrowLeft"] ? 1 : cr_keys["ArrowRight"] ? -1 : 0;
  cr_cameraRotation += T * R;

  // Update camera position based on input
  const C = cr_Mathcos(cr_cameraRotation),
  S = cr_Mathsin(cr_cameraRotation),
  V = 0.08,            // Velocity
  L = V + 0.5,         // Lookahead distance
  M = (cr_keys["ArrowUp"] ? -1 : cr_keys["ArrowDown"] ? 1 : 0),
  cr_targetPosition = [cr_cameraPosition[0] + M * S * V, cr_cameraPosition[1], cr_cameraPosition[2] + M * C * V];

  if (M != 0 && !cr_doesCollidesWithWalls(cr_cameraPosition, M * S * L, M * C * L) && !cr_doesCollidesWithEnemy(cr_targetPosition, 0)) {
    cr_cameraPosition[0] += M * S * V;
    cr_cameraPosition[2] += M * C * V;
    cr_cameraTargetFloor = cr_getHighestFloorOrLowestCeiling(cr_cameraPosition, 0.5, 0);
    cr_catBobbing += 0.08;
  } else {
    cr_catBobbing = 0;
  }

  if (cr_keys["Space"] && !cr_cameraIsJumping) {
    cr_cameraIsJumping = 1;
    cr_cameraPosition[1] += cr_gravity;
    cr_cameraPosition[3] = 0.16;  // Jump speed
  }

  cr_updateGravity(cr_cameraPosition, cr_cameraTargetFloor);
  (cr_cameraPosition[1] === cr_cameraTargetFloor) && (cr_cameraIsJumping = 0);

  // If there was any movement, update the camera view matrix
  cr_cameraView = cr_updateMatrix([-cr_cameraPosition[0], -cr_cameraPosition[1]-0.5, -cr_cameraPosition[2]], cr_cameraRotation);

  if (cr_keys["KeyZ"] === 1 && !cr_cameraAttackDelay) {
    cr_cameraAttackDelay = 10;
    cr_keys["KeyZ"] = 2;
    cr_createProjectile(cr_cameraPosition[0], cr_cameraPosition[1]+0.4, cr_cameraPosition[2], [-S, -C], 4);
  }
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
  //cr_gl.enable(2884);   // Enable culling
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
  }
  cr_gl.linkProgram(cr_program);
  cr_gl.useProgram(cr_program);

  // Init the input
  cr_document.addEventListener("keydown", (cr_event) => 
    (!cr_keys[cr_event.code]) && (cr_keys[cr_event.code] = 1)
  );
  cr_document.addEventListener("keyup", (cr_event) => 
    cr_keys[cr_event.code] = 0
  );
}

function cr_initEngine2D() {
  cr_canvas2D = cr_document.getElementById("cg2");
  cr_canvas2D.width = cr_width;
  cr_canvas2D.height = cr_height;

  cr_ctx2D = cr_canvas2D.getContext("2d");
  cr_ctx2D.imageSmoothingEnabled = 0;
}

function cr_loadTextures() {
  for (let I=0;I<5;I++){
    cr_textures[I] = cr_gl.createTexture();
    const cr_image = new Image();
    const A = 3553;
    cr_image.src = cr_img[I];
    cr_image.onload = () => {
      cr_gl.bindTexture(A, cr_textures[I]);
      cr_gl.texImage2D(A, 0, 6408, 6408, 5121, cr_image);
      cr_gl.texParameteri(A, 10240, 9728);
      cr_gl.texParameteri(A, 10241, 9728);
      if (cr_img_clamp_to_edges[I]) {
        cr_gl.texParameteri(A, 10242, 33071);
        cr_gl.texParameteri(A, 10243, 33071);
      }
    };
  }
}

/**
 * SECTION PHYSICS
 */
// In order PlayerX1, PZ1, PX2, PZ2, WallX1, WZ1, WX2, WZ2
//                A0,  A2,  A3, A4,      A5,  A6,  A7,  A8
function cr_linesIntersect(...A) {
  const D = (A[2] - A[0]) * (A[7] - A[5]) - (A[3] - A[1]) * (A[6] - A[4]);
  if (D === 0) return 0;
  
  const T = ((A[4] - A[0]) * (A[7] - A[5]) - (A[5] - A[1]) * (A[6] - A[4])) / D,
  U = ((A[4] - A[0]) * (A[3] - A[1]) - (A[5] - A[1]) * (A[2] - A[0])) / D;

  return T >= 0 && T <= 1 && U >= 0 && U <= 1;
}

function cr_doesCollidesWithWalls(P, X, Y) {
  for (let J=0;J<cr_walls.length;J++) {
    if (P[1] >= cr_walls[J][1] - 0.2) continue;
    if (P[1]+1 <= cr_walls[J][0]) continue;
    for (let I = 3; I < cr_walls[J].length; I+=2) {
      if (cr_linesIntersect(P[0], P[2], P[0] + X, P[2] + Y, ...cr_walls[J].slice(I, I+4))) return 1;
    }
  }

  return 0;
}

// Get the highest floor for an entity to fall or to raise to
function cr_getHighestFloorOrLowestCeiling(P, S, cr_isCeiling) {
  let cr_result = cr_isCeiling ? Infinity : 0,
  X1 = P[0] - S,
  X2 = P[0] + S,
  Z1 = P[2] - S,
  Z2 = P[2] + S;
  
  for (let I=0;I<cr_planes.length;I+=6) {
    if (X2 < cr_planes[I+2] || X1 > cr_planes[I+4]) continue;
    if (Z2 < cr_planes[I+3] || Z1 > cr_planes[I+5]) continue;
    (cr_planes[I] >= P[1] && cr_isCeiling) && (cr_result = cr_Math.min(cr_planes[I], cr_result));
    (cr_planes[I] <= P[1] + 0.2 && !cr_isCeiling) && (cr_result = cr_Math.max(cr_planes[I], cr_result));
  }

  return cr_result;
}

// moves the entity to it's floor position
function cr_updateGravity(P, T) {
  if (P[1] < T) 
    P[1] = cr_Math.min(P[1] + 0.1, T);
  else if (P[1] > T) {
    (P[3] >= 0) && (P[3] -= cr_gravity);
    (P[3] < 0) && (P[3] -= cr_gravity/5);
    P[1] += P[3];
    if (P[1] <= T) {
      P[1] = cr_Math.min(P[1] + 0.1, T);
      P[3] = 0;
    }
    if (P[3] > 0) {
      const cr_ceiling = cr_getHighestFloorOrLowestCeiling(P, 0.5, 1);
      if (cr_ceiling <= P[1] + 0.5) {
        P[1] = cr_ceiling - 0.51;
      }
    }
  }
}

// Check for collisions with enemies
function cr_doesCollidesWithEnemy(P, cr_self) {
  for (let I=0;I<cr_enemies.length;I++) {
    const cr_enemy = cr_enemies[I];
    if (cr_enemy === cr_self || cr_enemy.cr_state === 3) continue;
    if (P[1] > cr_enemy.cr_position[1] + 0.8) continue;
    if (P[1]+1 < cr_enemy.cr_position[1]) continue;

    const cr_distance = (P[0] - cr_enemy.cr_position[0]) ** 2 + (P[2] - cr_enemy.cr_position[2]) ** 2;
    if (cr_distance <= 1) return cr_enemy;
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
  cr_gl.bindTexture(3553, cr_textures[cr_geometry.cr_textureIndex]);
  cr_gl.uniform1i(cr_textureLocation, 0);

  cr_gl.drawElements(4, cr_geometry.cr_indices.length, 5123, 0); // 4 is for TRIANGLES, 6 is the number of indices, 5123 is for UNSIGNED_SHORT
}

function cr_bindGeometry(cr_geometry) {
  cr_geometry.cr_vertexBuffer = cr_gl.createBuffer();
  cr_gl.bindBuffer(34962, cr_geometry.cr_vertexBuffer); // 34962 is for ARRAY_BUFFER
  cr_gl.bufferData(34962, new Float32Array(cr_geometry.cr_vertices), 35044); // 35044 is for STATIC_DRAW

  cr_geometry.cr_indexBuffer = cr_gl.createBuffer();
  cr_gl.bindBuffer(34963, cr_geometry.cr_indexBuffer);  // 34963 is for ELEMENT_ARRAY_BUFFER
  cr_gl.bufferData(34963, new Uint16Array(cr_geometry.cr_indices), 35044);   // 35044 is for STATIC_DRAW
}

function cr_buildRoomGeometry() {
  for (let J=0;J<cr_walls.length;J++) {
    const cr_roomWalls = cr_walls[J],
    cr_geometry = {};
    cr_geometry.cr_vertices = [];
    cr_geometry.cr_indices = [];
    cr_geometry.y1 = cr_roomWalls[0];
    cr_geometry.y2 = cr_roomWalls[1];
    cr_geometry.cr_textureIndex = cr_roomWalls[2];
    let cr_indexOffset = 0, 
    Y1 = cr_roomWalls[0], Y2 = cr_roomWalls[1],
    I, X1, X2, Z1, Z2, TX, TY;
    for (I=3;I<cr_roomWalls.length-2;I+=2) {
      X1 = cr_roomWalls[I], Z1 = cr_roomWalls[I+1];
      X2 = cr_roomWalls[I+2], Z2 = cr_roomWalls[I+3];
      TX = cr_Math.sqrt((X2 - X1) ** 2 + (Z2 - Z1) ** 2);
      TY = cr_roomWalls[1] - cr_roomWalls[0];

      // Add two triangles for each rectangle defined by the coordinates
      cr_geometry.cr_vertices.push(
        X1, Y1, Z1,  0, TY,
        X2, Y1, Z2, TX, TY,
        X1, Y2, Z1,  0, 0,
        X2, Y2, Z2, TX, 0
      );

      cr_geometry.cr_indices.push(
        cr_indexOffset + 0, cr_indexOffset + 1, cr_indexOffset + 2,
        cr_indexOffset + 2, cr_indexOffset + 1, cr_indexOffset + 3
      );
      cr_indexOffset += 4;
    }

    cr_bindGeometry(cr_geometry);
    cr_geometries.push(cr_geometry);
  }
}

function cr_buildPlanesGeometry() {
  for (let I=0;I<cr_planes.length;I+=6) {
    const cr_geometry = {};
    cr_geometry.y = cr_planes[I];
    cr_geometry.cr_textureIndex = cr_planes[I + 1];
    const X1 = cr_planes[I + 2],
    Z1 = cr_planes[I + 3],
    X2 = cr_planes[I + 4],
    Z2 = cr_planes[I + 5],
    Y = cr_planes[I],
    TX = X2 - X1,
    TY = Z2 - Z1;

    cr_geometry.cr_vertices = [
      X1, Y, Z2,  0, TY,
      X2, Y, Z2, TX, TY,
      X1, Y, Z1,  0, 0,
      X2, Y, Z1, TX, 0
    ];

    cr_geometry.cr_indices = [
      0, 1, 2,
      2, 1, 3
    ];

    cr_bindGeometry(cr_geometry);
    cr_geometries.push(cr_geometry);
  }
}

function cr_createBillboard(W, H, T, UV) {
  const cr_geometry = {},
  cr_HW = W/2;

  cr_geometry.cr_vertices = [
    0, 0, -cr_HW,  UV[0], UV[3],
    0, 0, cr_HW,  UV[2], UV[3],
    0, H, -cr_HW, UV[0], UV[1],
    0, H, cr_HW,  UV[2], UV[1]
  ];

  cr_geometry.cr_indices = [
    0, 1, 2,
    2, 1, 3
  ];

  cr_geometry.cr_textureIndex = T;

  cr_bindGeometry(cr_geometry);

  return cr_geometry;
}

/**
 * SECTION ENEMIES
 */
function cr_createEnemy(X, Y, Z, cr_texture, cr_hp) {
  const cr_geometryWalk = [],
  cr_geometryDeath = [],
  cr_geometryAttack = [];
  let I;
  for (I of [0,1,2,1])
    cr_geometryWalk.push(cr_createBillboard(1, 1, cr_texture, cr_smallUvs[I]));
  for (I of [4,5])
    cr_geometryDeath.push(cr_createBillboard(1, 1, cr_texture, cr_smallUvs[I]));
  for (I of [6,7,6,1])
    cr_geometryAttack.push(cr_createBillboard(1, 1, cr_texture, cr_smallUvs[I]));
  
  cr_enemies.push({
    cr_position: [X, Y, Z, 0], // x, y, z, vertical speed
    cr_matriz: cr_matTranslate(X, Y, Z),
    cr_frame: 0,
    cr_geometry: null,
    cr_geometryWalk,
    cr_geometryDeath,
    cr_geometryAttack,
    cr_geometryHurt: cr_createBillboard(1, 1, cr_texture, cr_smallUvs[3]),
    cr_state: 0,                // 0: Idle/Walk, 1: Hurt, 2: Dying, 3: Dead, 4: Attack
    cr_hurt: 0,                 // How long the enemy is hurt
    cr_attackCooldown: 0,       // How long until the enemy can attack again
    cr_active: 0,
    cr_speed: 0.03,
    cr_targetFloor: Y,
    cr_destroy: 0,
    cr_hp
  });
}

function cr_enemyMeleeAttack(cr_enemy) {
  const cr_dx = (cr_cameraPosition[0] - cr_enemy.cr_position[0]),
  cr_dz = (cr_cameraPosition[2] - cr_enemy.cr_position[2]),
  cr_length = cr_Math.sqrt(cr_dx ** 2 + cr_dz ** 2);
  (cr_length <= 1.5) && cr_cameraHealth--;
  if (cr_cameraHealth <= 0) cr_cameraState = 1;
}

function cr_updateEnemy(cr_enemy) {
  cr_enemy.cr_attackCooldown = cr_Math.max(cr_enemy.cr_attackCooldown - 1, 0);

  // Update geometry
  switch (cr_enemy.cr_state) {
    case 0:
      cr_enemy.cr_frame = (cr_enemy.cr_frame + cr_spriteSpeed) % 4; // Cycle through frames
      cr_enemy.cr_geometry = cr_enemy.cr_geometryWalk[cr_enemy.cr_frame << 0];
      break;
    case 1:
      cr_enemy.cr_geometry = cr_enemy.cr_geometryHurt;
      if (--cr_enemy.cr_hurt <= 0) {
        cr_enemy.cr_state = 0;
      }
      return;
    case 2:
      cr_enemy.cr_frame += cr_spriteSpeed;
      cr_enemy.cr_geometry = cr_enemy.cr_geometryDeath[cr_enemy.cr_frame << 0];
      if (cr_enemy.cr_frame >= 2) {
        cr_enemy.cr_geometry = cr_enemy.cr_geometryDeath[1];
        cr_enemy.cr_state = 3;
      }
      return;
    case 4:
      const cr_previousFrame = cr_enemy.cr_frame << 0;
      cr_enemy.cr_frame += cr_spriteSpeed;
      cr_enemy.cr_geometry = cr_enemy.cr_geometryAttack[cr_enemy.cr_frame << 0];
      if ((cr_enemy.cr_frame<<0) === 3 && cr_previousFrame == 2) {
        cr_enemyMeleeAttack(cr_enemy);  
      }
      if (cr_enemy.cr_frame+cr_spriteSpeed >= 4) {
        cr_enemy.cr_state = 0;
      }
      return;
  }

  if (cr_cameraState) return;

  // Update movement
  const cr_dx = (cr_cameraPosition[0] - cr_enemy.cr_position[0]),
  cr_dz = (cr_cameraPosition[2] - cr_enemy.cr_position[2]),
  cr_length = cr_Math.sqrt(cr_dx ** 2 + cr_dz ** 2);

  if (cr_length > 8 && !cr_enemy.cr_active) return;

  const cr_enemyEyePosition = [cr_enemy.cr_position[0], cr_enemy.cr_position[1] + 1, cr_enemy.cr_position[2]];
  if (!cr_enemy.cr_active && cr_doesCollidesWithWalls(cr_enemyEyePosition, cr_dx, cr_dz))
    return;

  cr_enemy.cr_active = 1;

  if (cr_length <= 1.2) {
    if (cr_enemy.cr_attackCooldown <= 0){
      cr_enemy.cr_state = 4;
      cr_enemy.cr_frame = 0;
      cr_enemy.cr_attackCooldown = 120;
    }  
    return;
  }

  const cr_dirx = cr_dx / cr_length,
  cr_dirz = cr_dz / cr_length;

  if (!cr_doesCollidesWithWalls(cr_enemy.cr_position, cr_dirx * 0.5, cr_dirz * 0.5)){
    cr_enemy.cr_position[0] += cr_dirx * cr_enemy.cr_speed;
    cr_enemy.cr_position[2] += cr_dirz * cr_enemy.cr_speed;
  } else {
    if (!cr_doesCollidesWithWalls(cr_enemy.cr_position, cr_dirx * 0.5, 0)) {
      cr_enemy.cr_position[0] += cr_dirx * cr_enemy.cr_speed;
    } 
    if (!cr_doesCollidesWithWalls(cr_enemy.cr_position, 0, cr_dirz * 0.5)) {
      cr_enemy.cr_position[2] += cr_dirz * cr_enemy.cr_speed;
    } 
  }
  
  cr_enemy.cr_targetFloor = cr_getHighestFloorOrLowestCeiling(cr_enemy.cr_position, 0.5, 0);
  cr_updateGravity(cr_enemy.cr_position, cr_enemy.cr_targetFloor);
}

/**
 * SECTION PROJECTILES
 */
function cr_createProjectile(X, Y, Z, cr_direction, cr_texture) {
  cr_projectiles.push({
    cr_position: [X, Y, Z, 0], // x, y, z, vertical speed
    cr_matriz: cr_matTranslate(X, Y, Z),
    cr_geometry: cr_createBillboard(0.1, 0.1, cr_texture, [0,0,1,1]),
    cr_direction,
    cr_destroy: 0,
    cr_timeToLive: 180            // 180 frames
  });
}

function cr_updateProjectile(cr_projectile) {
  const cr_xTo = cr_projectile.cr_direction[0] * 0.13,
  cr_zTo = cr_projectile.cr_direction[1] * 0.13;

  if (cr_doesCollidesWithWalls(cr_projectile.cr_position, cr_xTo, cr_zTo)) {
    cr_projectile.cr_destroy = 1;
    return;
  }

  cr_projectile.cr_position[0] += cr_xTo;
  cr_projectile.cr_position[2] += cr_zTo;

  const cr_enemy = cr_doesCollidesWithEnemy(cr_projectile.cr_position, 0);
  if (cr_enemy) {
    cr_projectile.cr_destroy = 1;
    if (--cr_enemy.cr_hp <= 0) {
      cr_enemy.cr_state = 2;
      cr_enemy.cr_frame = 0;
    } else {
      cr_enemy.cr_state = 1;
      cr_enemy.cr_hurt = 10;
    }
  }

  if (--cr_projectile.cr_timeToLive <= 0) {
    cr_projectile.cr_destroy = 1;
  }
}

/**
 * SECTION GAME LOOP
 */
function cr_update() {
  cr_gl.clear(16640); // 16640 is for COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT

  cr_updateCamera();
  let I;
  for (I=0;I<cr_geometries.length;I++)
    cr_renderGeometry(cr_geometries[I], cr_identityMatrix);

  // Render the HUD
  cr_ctx2D.clearRect(0, 0, cr_width, cr_height);
  if (cr_cameraState === 0){
    const S = cr_Math.sin(cr_catBobbing);
    if (cr_cameraAttackDelay) { 
      cr_ctx2D.drawImage(cr_img_2d[2], 280, 258 + cr_cameraAttackDelay, 240, 192); 
      cr_cameraAttackDelay--;
    } 
    else {
      (!cr_cameraIsJumping) && cr_ctx2D.drawImage(cr_img_2d[0], 320+S*16, 274+cr_Mathabs(S)*8, 160, 176);
      (cr_cameraIsJumping) && cr_ctx2D.drawImage(cr_img_2d[1], 288, 234, 224, 216);
    }
  }

  // Update the enemies
  for (I=0;I<cr_enemies.length;I++) {
    (cr_enemies[I].cr_state !== 3) && cr_updateEnemy(cr_enemies[I]);
    cr_enemies[I].cr_matriz = cr_updateMatrix(cr_enemies[I].cr_position, -cr_cameraRotation+cr_pi_2, 0);
    cr_renderGeometry(cr_enemies[I].cr_geometry, cr_enemies[I].cr_matriz);
  }

  // Update the projectiles
  for (I=0;I<cr_projectiles.length;I++) {
    cr_updateProjectile(cr_projectiles[I]);
    cr_projectiles[I].cr_matriz = cr_updateMatrix(cr_projectiles[I].cr_position, -cr_cameraRotation+cr_pi_2, 0);
    cr_renderGeometry(cr_projectiles[I].cr_geometry, cr_projectiles[I].cr_matriz);
  }

  cr_enemies = cr_enemies.filter(cr_enemy => !cr_enemy.cr_destroy);
  cr_projectiles = cr_projectiles.filter(cr_projectile => !cr_projectile.cr_destroy);

  requestAnimationFrame(cr_update);
}

/**
 * SECTION MAIN FUNCTION
 * 
 * This is the main function that initializes the engine and starts the game.
 */
function cr_main() {
  cr_initEngine();
  cr_initEngine2D();
  cr_loadTextures();
  cr_buildRoomGeometry();
  cr_buildPlanesGeometry();
  cr_createEnemy(9,0,9,3,3);
  cr_update();
}

cr_main();