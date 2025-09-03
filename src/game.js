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
uniform vec2 u_tm;
varying vec2 v_uv;
void main() {
  vec4 c = texture2D(u_tex, v_uv + u_tm.x);
  if (c.a == 0.0) discard;
  gl_FragColor = c;
}
`,

cr_palette = [
  [190, 74, 47],
  [216, 118, 68],
  [234, 212, 170],
  [228, 166, 114],
  [184, 111, 80],
  [116, 63, 57],
  [63, 40, 50],
  [158, 40, 53],
  [228, 59, 68],
  [247, 118, 34],
  [254, 174, 52],
  [254, 231, 97],
  [99, 199, 77],
  [62, 137, 72],
  [38, 92, 66],
  [25, 60, 62],
  [18, 78, 137],
  [0, 149, 233],
  [44, 232, 245],
  [255, 255, 255],
  [192, 203, 220],
  [139, 155, 180],
  [90, 105, 136],
  [58, 68, 102],
  [38, 43, 68],
  [255, 0, 68],
  [24, 20, 37],
  [104, 56, 108],
  [181, 80, 136],
  [246, 117, 122],
  [232, 183, 150],
  [194, 133, 105]
],

cr_paletteAscii = '0123456789abcdefghijklmnopqrstuvw',

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
  // Kitchen
  [0, 2, 0, 8.8, 12, 9, 12, 9, 4, 17, 4, 17, 9, 17.2, 9, 17.2, 4],
  [0, 2, 0, 9, 15, 9, 13, 8.8, 13],
  [1.5, 2, 0, 9, 13, 9, 12],
  // Dining table
  [0.6, 0.8, 22, 10, 7, 10, 8, 12.2, 8, 12.2, 7, 10, 7],
  [0, 0.6, 22, 10, 7, 10, 7.1, 10.1, 7.1, 10.1, 7, 10, 7],
  [0, 0.6, 22, 10, 7.9, 10, 8, 10.1, 8, 10.1, 7.9, 10, 7.9],
  [0, 0.6, 22, 12.1, 7, 12.1, 7.1, 12.2, 7.1, 12.2, 7, 12.1, 7],
  [0, 0.6, 22, 12.1, 7.9, 12.1, 8, 12.2, 8, 12.2, 7.9, 12.1, 7.9],
  // Dining table chairs
  [0.5, 1, 22, 10.2, 6.7, 10.2, 6.8, 10.8, 6.8, 10.8, 6.7, 10.2, 6.7],      // Chair 1
  [0, 0.5, 22, 10.2, 6.7, 10.2, 6.8, 10.3, 6.8, 10.3, 6.7, 10.2, 6.7],
  [0, 0.5, 22, 10.7, 6.7, 10.7, 6.8, 10.8, 6.8, 10.8, 6.7, 10.7, 6.7],
  [0, 0.5, 22, 10.2, 7.2, 10.2, 7.3, 10.3, 7.3, 10.3, 7.2, 10.2, 7.2],
  [0, 0.5, 22, 10.7, 7.2, 10.7, 7.3, 10.8, 7.3, 10.8, 7.2, 10.7, 7.2],
  [0.4, 0.5, 22, 10.2, 6.8, 10.2, 7.3, 10.8, 7.3, 10.8, 6.8, 10.2, 6.8],
  [0.5, 1, 22, 11.4, 6.7, 11.4, 6.8, 12, 6.8, 12, 6.7, 11.4, 6.7],          // Chair 2
  [0, 0.5, 22, 11.4, 6.7, 11.4, 6.8, 11.5, 6.8, 11.5, 6.7, 11.4, 6.7],
  [0, 0.5, 22, 11.9, 6.7, 11.9, 6.8, 12, 6.8, 12, 6.7, 11.9, 6.7],
  [0, 0.5, 22, 11.4, 7.2, 11.4, 7.3, 11.5, 7.3, 11.5, 7.2, 11.4, 7.2],
  [0, 0.5, 22, 11.9, 7.2, 11.9, 7.3, 12, 7.3, 12, 7.2, 11.9, 7.2],
  [0.4, 0.5, 22, 11.4, 6.8, 11.4, 7.3, 12, 7.3, 12, 6.8, 11.4, 6.8],
  [0.5, 1, 22, 10.2, 8.2, 10.2, 8.3, 10.8, 8.3, 10.8, 8.2, 10.2, 8.2],      // Chair 3
  [0, 0.5, 22, 10.2, 7.7, 10.2, 7.8, 10.3, 7.8, 10.3, 7.7, 10.2, 7.7],
  [0, 0.5, 22, 10.7, 7.7, 10.7, 7.8, 10.8, 7.8, 10.8, 7.7, 10.7, 7.7],
  [0, 0.5, 22, 10.2, 8.2, 10.2, 8.3, 10.3, 8.3, 10.3, 8.2, 10.2, 8.2],
  [0, 0.5, 22, 10.7, 8.2, 10.7, 8.3, 10.8, 8.3, 10.8, 8.2, 10.7, 8.2],
  [0.4, 0.5, 22, 10.2, 7.8, 10.2, 8.3, 10.8, 8.3, 10.8, 7.8, 10.2, 7.8],
  [0.5, 1, 22, 11.4, 8.2, 11.4, 8.3, 12, 8.3, 12, 8.2, 11.4, 8.2],          // Chair 4
  [0, 0.5, 22, 11.4, 7.7, 11.4, 7.8, 11.5, 7.8, 11.5, 7.7, 11.4, 7.7],
  [0, 0.5, 22, 11.9, 7.7, 11.9, 7.8, 12, 7.8, 12, 7.7, 11.9, 7.7],
  [0, 0.5, 22, 11.4, 8.2, 11.4, 8.3, 11.5, 8.3, 11.5, 8.2, 11.4, 8.2],
  [0, 0.5, 22, 11.9, 8.2, 11.9, 8.3, 12, 8.3, 12, 8.2, 11.9, 8.2],
  [0.4, 0.5, 22, 11.4, 7.8, 11.4, 8.3, 12, 8.3, 12, 7.8, 11.4, 7.8],
  // Main House
  [0, 2, 1, 17, 4, 20.6, 4, 20.6, 0, 23, 0, 23, 1, 23.2, 1],
  [0, 2, 1, 23.2, 2, 23, 2, 23, 4, 27, 4, 27, 12, 25, 14, 22, 14, 20, 12, 19.5, 12, 19.5, 18, 18.5, 18, 18.5, 18.2],
  [0, 2, 1, 17.5, 18.2, 17.5, 18, 16, 18, 16, 15, 9, 15],
  [1.5, 2, 1, 23, 1, 23, 2],
  [1.5, 2, 1, 18.5, 18, 17.5, 18],
  // Bathroom
  [0, 2, 2, 23.2, 1, 23.2, 0, 27, 0, 27, 3.8, 23.2, 3.8, 23.2, 2],
  [1.5, 2, 2, 23.2, 2, 23.2, 1],
  // Garage
  [0, 2, 5, 8.8, 13, 8.8, 16, 7, 16, 7, 16.2],
  [0, 2, 5, 2, 16.2, 2, 16, 0, 16, 0, 4, 8.8, 4, 8.8, 12],
  [1.5, 2, 5, 8.8, 12, 8.8, 13],

  // 2nd floor
  // Hallway
  [1.8, 2, 22, 20.5, 4, 20.5, 5.4, 20.5, 4],
  [2, 4, 1, 17, 9, 17.2, 9, 17.2, 4, 22, 4, 22, 5, 22.2, 5],
  [2, 4, 1, 22.2, 6, 21, 6, 21, 10, 21.2, 10],
  [2, 4, 1, 21.2, 11, 20, 11, 17.2, 11, 17.2, 10, 17, 10],
  [3.5, 4, 1, 22, 5, 22, 6],
  [3.5, 4, 1, 21, 10, 21, 11],
  [3.5, 4, 1, 20, 11, 19, 11],
  [3.5, 4, 1, 17.2, 10, 17.2, 9],
  // Bedroom 1
  [2, 4, 29, 22.2, 5, 22.2, 4, 27, 4, 27, 9.8, 22.2, 9.8, 22.2, 6],
  [3.5, 4, 29, 22.2, 6, 22.2, 5],
  // Bedroom 2
  [2, 4, 29, 21.2, 10, 26, 10, 26, 15, 21.2, 15, 21.2, 11],
  [3.5, 4, 29, 21.2, 11, 21.2, 10],
  // Bedroom 3
  [2, 4, 29, 12, 11.2, 12, 11, 9, 11, 9, 4, 17, 4, 17, 9],
  [2, 4, 29, 17, 10, 17, 11, 13, 11, 13, 11.2],
  [3.5, 4, 29, 17, 9, 17, 10],
  [3.5, 4, 29, 13, 11, 12, 11],
  // Bathroom
  [2, 4, 2, 13, 11.2, 14, 11.2, 14, 14, 10, 14, 10, 11.2, 12, 11.2],
  [3.5, 4, 2, 12, 11.2, 13, 11.2],
],
cr_e1m1Planes = [ // Planes coordinates set by y, textureId, x1, z1, x2, z2, isFloor
  // Floors
  // Kitchen
  0, 6, 9, 4, 17, 9, 1,       // Floor
  // Dining table
  0.8, 15, 10, 7, 12.2, 8, 1,
  0.6, 15, 10, 7, 12.2, 8, 1,
  // Dining table chairs
  1, 15, 10.2, 6.7, 10.8, 6.8, 1,    // Chair 1
  0.5, 1, 10.2, 6.8, 10.8, 7.3, 1,
  1, 15, 11.4, 6.7, 12, 6.8, 1,      // Chair 2
  0.5, 1, 11.4, 6.8, 12, 7.3, 1,
  1, 15, 10.2, 8.2, 10.8, 8.3, 1,    // Chair 3
  0.5, 1, 10.2, 7.6, 10.8, 8.2, 1,
  1, 15, 11.4, 8.2, 12, 8.3, 1,      // Chair 4
  0.5, 1, 11.4, 7.6, 12, 8.2, 1,
  // Living Room
  0, 17, 9, 9, 20, 15, 1,            // Floors
  0, 17, 16, 15, 20, 18, 1, 
  0, 17, 17, 4, 27, 9, 1,
  0, 17, 20, 9, 27, 14, 1, 
  0, 17, 20, 0, 23, 4, 1,
  // Bathroom
  0, 2, 23, 0, 27, 4, 1,

  // 2nd Floor
  // Hallway
  2, 17, 17, 5.4, 20.5, 11, 1,
  2, 17, 20.5, 6, 21, 11, 1,
  2, 17, 20.5, 4, 22, 6, 1,
  // Bedroom 1
  2, 17, 22, 4, 27, 9.8, 1,
  // Bedroom 2
  2, 17, 21, 10, 27, 17, 1,
  // Bedroom 3
  2, 17, 9, 4, 17, 11.2, 1, 
  // Bathroom
  2, 2, 10, 11.2, 14, 14, 1,

  // Ceilings
  // Kitchen
  2, 16, 9, 4, 17, 9, 0,
  // Living Room
  2, 16, 9, 9, 20, 15, 0,
  2, 16, 16, 15, 20, 18, 0,
  2, 16, 17, 5.4, 27, 9, 0,
  2, 16, 20, 9, 27, 14, 0,
  2, 16, 20.6, 0, 27, 5.4, 0,

  // 2nd Floor
  // Hallway
  4, 16, 17, 4, 20.5, 11, 0,
  4, 16, 20.5, 6, 21, 11, 0,
  4, 16, 20.5, 4, 22, 6, 0,
  // Bedroom 1
  4, 16, 22, 4, 27, 9.8, 0,
  // Bedroom 2
  4, 16, 21, 10, 27, 17, 0,
  // Bedroom 3
  4, 16, 9, 4, 17, 11.2, 0,
  // Bathroom
  4, 16, 10, 11.2, 14, 14, 0,
],
cr_e1m1Props = [
  // TextureUVs, x, y, z, isSolid
  0, 26.5, 0, 2.7, 1      // Toilet
];
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
cr_propsUVs = [
  [0,0,1/8,1/2],
  [1/8,0,2/8,1/2],
  [2/8,0,3/8,1/2],
  [3/8,0,4/8,1/2],
  [4/8,0,5/8,1/2],
  [5/8,0,6/8,1/2],
  [6/8,0,7/8,1/2],
  [7/8,0,8/8,1/2],
  [0,1/2,1/8,1],
  [1/8,1/2,2/8,1],
  [2/8,1/2,3/8,1],
  [3/8,1/2,4/8,1],
  [4/8,1/2,5/8,1],
  [5/8,1/2,6/8,1],
  [6/8,1/2,7/8,1],
  [7/8,1/2,8/8,1]
],
cr_img = [
  // Kitchen Wall 0
  [16, 16, "mmmmmmmmmmmmmmmmmlkkklmlkklmlkklmmmmmmmmmmmmmmmmkklmlkkklmlkklmlmmmmmmmmmmmmmmmmmlkkklmlkklmlkklmmmmmmmmmmmmmmmmkklmlkkklmlkklmlmmmmmmmmmmmmmmmmmlkkklmlkklmlkklmmmmmmmmmmmmmmmmkklmlkkklmlkklmlmmmmmmmmmmmmmmmmmlkkklmlkklmlkklmmmmmmmmmmmmmmmmkklmlkkklmlkklml"],
  // Main House Wall 1
  [16, 32, "66666666666666666677677667667767777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777776666666666666666qqqqqqqqqqqqqqqqkkkkkkkkkkkkkkkkllllllllllllllll"],
  // Bathroom Wall 2
  [16, 16, "mmmmmmmmmmmmmmmmmkkkmkkkmkkkmkkkmlllmlllmlllmlllmlllmlllmlllmlllmmmmmmmmmmmmmmmmmkkkmkkkmkkkmkkkmlllmlllmlllmlllmlllmlllmlllmlllmmmmmmmmmmmmmmmmmkkkmkkkmkkkmkkkmlllmlllmlllmlllmlllmlllmlllmlllmmmmmmmmmmmmmmmmmkkkmkkkmkkkmkkkmlllmlllmlllmlllmlllmlllmlllmlll"],
  // Broom 3
  [128, 16, "      qq            qqq                 qq                                qq                                                         qabq          qabbq               qbaq                              qaaq                                        qqqqq            qabq          qabbq             qbaq            qq                  qbbq                         q           qqabbbaqq           qabq          qabq            qbaq            q88qq                 qbq                        qaq         qabbjjjbbbq           qbq           qaq            qbq            q87778q                qbq                        qbqq        qaabbbbbbaq           qaq           qaq            qaq           q87qqq78q              qaqq                        qbqq         qqabbbaqq            qbq           qbq            qbq          q77q   q78q        q   qaaq                         qbqaq          qqqqq              qbq           qbq            qbq          q7q     q78q      qq  qbbq                          qbqaq           qbq               qaq           qaq            qaq           q       q7q     qaaq  qq                           qaqq            qaq              qabq           qqq            qbaq                 q78q      qqq                               qqq             qqq            qqqaq            qbvq            qaqqq             qqq7q       qbvqqq                           qabaq           qabaq          qvqbqq           qvquvq           qqbqvq           qsq8qq       qqquvvq                         qvqqqvq         qvqqqvq        qvuvqvq           qvvuvq           qvqvuvq         qstsqsq       qvvvuvvq                        qvuvuvq         qvuvuvq        quvvuvq           quvuvq           qvuvvuq         qtsstsq       quvuuuvvq       qqqqqqqqqq      qvuvuvq         qvuvuvq       qvvuuvq            qvuvuvq           qvuuvvq       qssttsq         qvvuvuq      qquvuuvuqqbaq    qvuvuvuvq       qvuvuvuvq       quvuq              qvuvuvq           quvuq         qtstq           qvqqq       qbquvuuvvvqbq    quvuvuvuq       quvuvuvuq    "],
  // Projectile 4
  [8, 8, "  hhhh   hiiiih hijiijihhiijjiihhiijjiihhijiijih hiiiih   hhhh  "],
  // Garage Wall 5
  [16, 16, "6454644464446444654464446444644465446544644465446444654565446544644465456444654464456445644464456454654564546445644464446454644564456444645464456445645464546444654564546554645465456554655464546544655464546454644465546454644464546544645464456454644464446445"],
  // Kitchen Floor 6
  [16, 16, "kkkkkkkkkkkkkkkkkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkkkkkkkkkkkkkkkkklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmmklllllllkmmmmmmm"],
  // Countertop Front 7
  [16, 16, "qqqqqqqqqqqqqqqqnnnnnnnnnnnnnnnnmqqqqqqqqqqqqqqmmqlllllqqlllllqmmqmmmmmqqmmmmmqmmqmmmmmqqmmmmmqmmqmmmqmqqmqmmmqmmqmmmqmqqmqmmmqmmqmmmqmqqmqmmmqmmqmmmlmqqmlmmmqmmqmmmmmqqmmmmmqmmqmmmmmqqmmmmmqmmqqqqqqqqqqqqqqmmmmmmmmmmmmmmmmmllllllllllllllllqqqqqqqqqqqqqqqq"],
  // Countertop Sides 8
  [16, 16, "qqqqqqqqqqqqqqqqnnnnnnnnnnnnnnnnmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmllllllllllllllllqqqqqqqqqqqqqqqq"],
  // Countertop 9
  [16, 16, "nonnnnnnnnnonnnnnnnnonnnnnnnnnnnnnnnnnnnnnnnnonnnnnnnnnnnnonnnnnnnnonnnnonnnnnnonnnnnnnnnnnnnnnnonnnnnnnnnnnnnnnnnnnonnnnnnnonnnnnnnnnnnonnnnnnnnnnnnonnnnnnnnnnnonnnnnnnnnnnnnnnnnnnnnnnnnonnnnnnnnnnnonnnnnnnnnnnonnnnnnnnnnnnnnnnnonnnonnnnonnnnnnnnnnnnnnnnn"],
  // Fridge Front 10
  [16, 32, "qqqqqqqqqqqqqqqqqllllllllllllllqqkkkkkkkkkkkkklqqkqkkkkkkkkkkllqqkqkkkkkkkkkkklqqkqkkkkkkkkkkllqqkqkkkkkkkkkkklqqklkkkkkkkkkkllqqllllllllllllllqqqqqqqqqqqqqqqqqqllllllllllllllqqkqkkkkkkkkkkklqqkqkkkkkkkkkkllqqkqkkkkkkkkkkklqqkqkkkkkkkkkkllqqklkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqllllllllllllllqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"],
  // Fridge Side 11
  [16, 32, "qqqqqqqqqqqqqqqqqllllllllllllllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqkkkkkkkkkkkkllqqkkkkkkkkkkkkklqqllllllllllllllqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"],
  // Fridge Top 12
  [16, 16, "qqqqqqqqqqqqqqqqqllllllllllllllqqlklklklklklkllqqllkkkkkkkkkkklqqlkkkkkkkkkkkllqqllkkkkkkkkkkklqqlkkkkkkkkkkkllqqllkkkkkkkkkkklqqlkkkkkkkkkkkllqqllkkkkkkkkkkklqqlkkkkkkkkkkkllqqllkkkkkkkkkkklqqlkkkkkkkkkkkllqqllklklklklklklqqllllllllllllllqqqqqqqqqqqqqqqqq"],
  // Stove front 13
  [16, 16, "kkqkkkkqkkkkqkkkkqqqkkqqqkkqqqkkklqlkklqlkklqlkkkklkkkklkkkklkkkqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnnqnqnnqqqqqqqqqqqqqqqqqqqqllllllllllllllllkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"],
  // Stove top 14
  [16, 16, "qqqqqqqqqqqqqqqqqnnnnnnnnnnnnnnqqnnqqqnnnnqqqnnqqnqnmqqnnqnmqqnqqnqmqqqnnqmqqqnqqnqnmnqnnqnmnqnqqnnqqqnnnnqqqnnqqnnnnnnnnnnnnnnqqnnnnnnnnnnnnnnqqnnqqqnnnnqqqnnqqnqnmqqnnqnmqqnqqnqmqqqnnqmqqqnqqnqnmnqnnqnmnqnqqnnqqqnnnnqqqnnqqnnnnnnnnnnnnnnqqqqqqqqqqqqqqqqq"],
  // Wood 15
  [1, 1, "5"],
  // Ceiling 16
  [16, 16, "llllllllllllllklllklllllklllllklllklllllkllllllllllllllllllklllllllllklllllklllllllllklllllllllllllllllllllllllllllklllllllllllllllklllklllllklllllllllklllllklllklllllllllllllllkllllllllklllllllllllklllkllllkllllllkllllllllkllllklllllllklllllllklllllllklll"],
  // Wooden floor 17
  [16, 16, "6456v666666644446444464v5446455464v5464v546645v46v454644v45645v46v464644656656446456v644545666666454v65454466444646456545446545666666655v46654456464v6v5v466v4456454v6v5v466444564v4v6445446544464v4464454565444644546445456544564454644v45654446446v65444565444"],
  // Drawer front 18
  [16, 16, "qqqqqqqqqqqqqqqqq6655566q6655566q65qqq56q65qqq56q6655566q6655566qqqqqqqqqqqqqqqqq655555555555556q55556qqqqq65555q655556666655556qqqqqqqqqqqqqqqqq65556qqqqq65556q655556666655556qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"],
  // Drawer side 19
  [16, 16, "q66555555555566qq65555555555556qq66555555555566qq65555555555556qq66555555555566qq65555555555556qq66555555555566qq65555555555556qq66555555555566qq65555555555556qq66555555555566qq65555555555556qq66555555555566qq65555555555556qq66555555555566qq65555555555556q"],
  // Sofa 20
  [16, 16, "eeefccdeeeefccdeeeffedddeeffedddddfeeedddffeeeddcceeeeedcceeeeedccdeeeefccdeeeefedddeeffedddeeffeedddffeeedddffeeeedcceeeeedcceeeeefccdeeeefccdeeeffedddeeffeddddffeeedddffeeeddcceeeeedcceeeeedccdeeeefccdeeeefedddeeffedddeeffeedddffeeedddffeeeedcceeeeedccee"],
  // Other Sofa 21
  [16, 16, "jkkkkkjjjkkkkkjjkkkkkkkjkkkkkkkjkkkkjkkkkkkjkkkkkkkjjjkkkkjjjkkkkkkkjkkkkkkjkkkjjkkkkkkkjkkkkkjjkkkkkkkjjjkkkkkjkkkjkkkkjkkkkkkkkkjjjkkkkkkkjkkkkkkjkkkkkkkjjjkkkkkkkkkjkkkkjkkkkkkkkkjjjkkkkkkjjkkjkkkjkkkjkkjjkkjjjkkkkkjjjkkjkkkjkkkkkkkjkkkkkkkkkkkjkkkkkkkj"],
  // Wood 22
  [16, 16, "65q6655655655565655q555655656555656q6556556q655555666556556q65655565655q655665655q656q55655655655q656q656556556q556556q56556q56q555q5565q655656q56565565555565565656556565556556q656556665556556q565q655665q65566565655556656556556q556565656qq665q6656q655556q6"],
  // TV Front 23
  [16, 16, "qqqqqqqqqqqqqqqqoooooooooooooooooqqqqqqqqqqqqqqooqqqqqqqqqqqqqqooqqqqqqqqqqqqqqooqqqqqqqqqqqqqqooqqqqqqqqqqqqqqooqqqqqqqqqqqqqqooqqqqqqqqqqqqqqooooooooooooooo7oqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"],
  // TV Back 24
  [1, 1, "q"],
  // Bookshelf 25
  [32, 32, "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq566655555555655555665555556665qq5qqqqqqqqqqqqqqqqqqqqqqqqqqqq6qq6qhgqdeqmnqbaq78qbaqhgqdeqdeq6qq6qggqddqmnqbbq87qbbqggqddqddq5qq6qghqeeqnmqabq88qabqghqeeqeeq5qq6qhgqedqnnqbaq77qbaqhgqedqedq5qq6qqqqqqqqqqqqqqqqqqqqqqqqqqqq5qq565555565565555655555655555565qq5qqqqqqqqqqqqqqqqqqqqqqqqqqqq5qq6qmnq78qhgqbaqbaqdeqhgq78qmnq6qq6qmnq87qggqbbqbbqddqggq87qmnq6qq6qnmq88qghqabqabqeeqghq88qnmq6qq6qnnq77qhgqbaqbaqedqhgq77qnnq6qq6qqqqqqqqqqqqqqqqqqqqqqqqqqqq6qq655555566555565565555555566556qq6qqqqqqqqqqqqqqqqqqqqqqqqqqqq6qq5qmnqbaqhgqdeq78qbaqmnqdeq78q6qq6qmnqbbqggqddq87qbbqmnqddq87q6qq6qnmqabqghqeeq88qabqnmqeeq88q6qq6qnnqbaqhgqedq77qbaqnnqedq77q6qq6qqqqqqqqqqqqqqqqqqqqqqqqqqqq6qq655555555655555555655555555556qq6qqqqqqqqqqqqqqqqqqqqqqqqqqqq6qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"],
  // Bathroom countertop side 26
  [16, 16, "qqqqqqqqqqqqqqqqjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjkkkkkkkkkkkkkkkkqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"],
  // Bathroom countertop 27
  [16, 16, "qqqqqqqqqqqqqqqqkkkkkkkkkkkkkkkkjjjjjjjjjjjjjjjjjjjjjlllllljjjjjjjjllkjjjjklljjjjjljjjjjjjjjjljjjlkjjjjnqjjjjkljjlkjjjnqnqjjjkljjlkjjjqnqnjjjkljjlkjjjjqnjjjjkljjjlkjjjjjjjjjljjjjjllkjjjjklljjjjjjjjlllllljjjjjjjjjjjjjjjjjjjjjkkkkkkkkkkkkkkkkqqqqqqqqqqqqqqqq"],
  // Props 28
  [128, 32, "                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    qqqqqqq                                                                                                                         qlllllq                                                                                                                        qqqkkklq                                                                                                                         qkkkklq                                                                                                                        qqqqqqqqq                                                                                                                       qkqqqqqlq                                                                                                                       qlkkkkklq                                                                                                                        qkkkklq                                                                                                                          qlklq                                                                                                                          qlqqqlq                                                                                                                         qlllllq                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     "],
  // Bedroom walls 29
  [16, 32, "mmmmmmmmmmmmmmmmqqqqqqqqqqqqqqqqleflllllleflllllkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkkefkkkkkleflllllleflllllqqqqqqqqqqqqqqqq666666666666666665555555555555556566666666666665656555555555556565655555555555656565555555555565656555555555556565655555555555656565555555555565656666666666666565555555555555556666666666666666"],
  // Wardrobe 30
  [16, 32, "qqqqqqqqqqqqqqqqq66656655555666qq55656555655565qq65656555665566qq65555555565565qq65656555555565qq65555665565665qq65655565556555qq55655555566556qq65555565556556qq65655555555555qq55556655556556qq65565655655565qq65565555656565qqqqqqqqqqqqqqqqqq65555565566656qq56655qqqq56565qq65555565565655qqqqqqqqqqqqqqqqqq65655555555556qq65555qqqq55566qq55565665555656qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"],
],
cr_img_clamp_to_edges = [0,0,0,1],
cr_newImage = (cr_src) => {
  const img = new Image();
  img.src = cr_src;
  return img;
},
cr_img2D = [
  // Cat Idle 0
  [20, 22, "        qqq               qq888qq            q7878888q          q777778888q        q77777777888q      q7776qq7787788q    q7776q66q7778778q   q776qqq66677777qq   q766q5qqqqqqqqqqq  q76qqq5qq444444qq5q q7q q6qqq555555qqq8qq76qq766qqqqqqqq887q q77qq777777777777q   qq  qqqqqqqqqqqq         qqqqqqqqqq         kkqqqqqqqqkk         qqqqqqqqqq   qqq     qq7777qq    qqqq     777777     qqqq    qqqqqqqq      qq   qqqqqqqqqq     qqq qqqqqqqqqqqq  "],
  // Cat Jump 1
  [28, 27, "          qqq                       qq888qq                    q7878888q                  q777778888q                q77777777888q              q7776qq7787788q            q7776q66q7778778q           q776qqq66677777qq           q766q5qqqqqqqqqqq          q76qqq5qq444444qq5q         q7q7q6qqq555555qqq8q  k    kqqqqq766qqqqqqqq887q qqqk  qqqqqqq777777777777q qqqqq kqqqqqq qqqqqqqqqqqq  qqqqqk  qqqqq  qqqqqqqqqq  qqqqq     qqqq  qqq7777qqq  qqqq      qqqqq qq777777qq qqqqq       qqqqq qqqqqqqq qqqqq        qqqqqqqqqqqqqqqqqqqq         qqqqqqqqqqqqqqqqqq           qqqqqqqqqqqqqqqq            qqqqqqqqqqqqqqqq             qqqqqqqqqqqqqq              qqqqqqqqqqqqqq              qqqqqqqqqqqqqq              qqqqqqqqqqqqqq             qqqqqqqqqqqqqqqq      "],
  // Cat Attack 2
  [30, 24, "        iiiii                       iihhhhhiii                   ihhqqqqqhhhi                 ihqq88888qqqhi    iiii       ihq7888888888qhii ihhhhi     ihq877777777777qhhihkqqkhi   ihq77777777777qqqqqhhqqqqhi   ihq7777777777qqq588qhqqqqkhi ihq77776666qqq4qqq87qhqqqqhi  ihq777qq66q44455q87qhhqqqhi   ihq776qqqq4455qq77qhihqqqhi   ihq776q5qqq5qq77qqqhihqqqhi   ihq77qqqqqqq77qqqqqqhhqqqhi   ihq777qq6677qqqqqqqqhhqqqhi   ihq7q7qhq7qqqqq7777qhqqqqhi   ihqq7qqhhqqqqq777qqqqqqqqhi    ihq77qhihhqq77qqqqqqqqqqhi     ihqqqhiiihqqqqqqqqqqqqqhi      ihhqhi  ihqqqqqqqqqqqqhi       iihi  ihqqqqqqqqqqqqqqhi        i   ihqqqqqqqqqqqqqqhi           ihqqqqqqqqqqqqqqqqhi          ihqqqqqqqqqqqqqqqqhi         ihqqqqqqqqqqqqqqqqqqhi"],
  // Cat Life 3
  [15, 13, "           q             qqq     q       qq     qq       qq   qqq       qq  qdqq       qq qqqqq7qqqqqqqq  qqq7qqqqqqqqq     7qqqqqqqqq     qqqqqqqqqq    qq qq qqqqqq  qqq qq qq  qq qqq qq qqq qqq"]
],
cr_textures2D = [];

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
  cr_lastTime = 0,
  cr_time = 0,

  cr_getUniformLocation = null, // Function to get uniform locations
  cr_uniformMatrix4fv = null,   // Function to set uniform matrices

  cr_cameraPosition = [2,0,9,0],       // Camera position in 3D space + vertical speed
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
  cr_cameraHurt = 0,              // Cooldown for camera red flash, in frames
  cr_cameraHeight = 0.5,

  cr_catBobbing = 0,

  cr_enemies = [],                      // Array to hold enemy objects
  cr_projectiles = [],                  // Array to hold projectile objects
  cr_props = [],                        // Array to hold prop objects

  cr_identityMatrix = cr_matTranslate(), // Static identity matrix for transformations
  cr_geometries = [],       // Object to hold geometries for different objects in the game
  cr_textures = [],
  
  cr_walls = cr_e1m1Walls,
  cr_planes = cr_e1m1Planes,
  cr_levelProps = cr_e1m1Props;


/**
 * SECTION MAP BUILDING
 */
function cr_addBlock(X1, Y1, Z1, W, H, L, cr_textures, cr_walls, cr_planes, cr_addBottom) {
  cr_textures = (cr_textures.length === 1) ? [cr_textures,cr_textures,cr_textures,cr_textures,cr_textures,cr_textures] : cr_textures;
  const X2 = X1 + W,
    Y2 = Y1 + H,
    Z2 = Z1 + L;

  // Textures are top:0, right:1, bottom:2, left:3, ceiling:4 and floor:5
  cr_walls.push(
    [Y1, Y2, cr_textures[0], X2, Z1, X1, Z1],
    [Y1, Y2, cr_textures[1], X2, Z2, X2, Z1],
    [Y1, Y2, cr_textures[2], X1, Z2, X2, Z2],
    [Y1, Y2, cr_textures[3], X1, Z1, X1, Z2],
  );
  cr_planes.push(Y2, cr_textures[4], X1, Z1, X2, Z2, 1); // Ceiling
  if (cr_addBottom) {
    cr_planes.push(Y1, cr_textures[5], X1, Z1, X2, Z2, 0); // Floor
  }
}

// E1M1 Furniture
// Kitchen
cr_addBlock(9, 0, 4, 1, 0.8, 1, [8, 8, 7, 8, 9, 8], cr_e1m1Walls, cr_e1m1Planes, 0); // Countertops
cr_addBlock(10, 0, 4, 1, 0.8, 1, [8, 8, 13, 8, 14, 8], cr_e1m1Walls, cr_e1m1Planes, 0); // Stove
cr_addBlock(11, 0, 4, 4, 0.8, 1, [8, 8, 7, 8, 9, 8], cr_e1m1Walls, cr_e1m1Planes, 0); // Countertops
cr_addBlock(15, 0, 4, 1, 1.5, 1, [11, 11, 10, 11, 12, 0], cr_e1m1Walls, cr_e1m1Planes, 0); // Fridge
// Living Room
// Drawers
cr_addBlock(9, 0, 9.5, 1, 0.7, 2, [19,18,19,19,19,19], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(10, 0, 14, 1, 0.7, 1, [18,19,19,19,19,19], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(18.5, 0, 13, 1, 0.7, 3, [19,19,19,18,19,19], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(18.6, 0, 5.4, 2, 0.7, 1, [19,19,18,19,19,19], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26, 0, 8, 1, 0.7, 3, [19,19,19,18,19,19], cr_e1m1Walls, cr_e1m1Planes, 0);
// Sofa
cr_addBlock(11, 0, 14, 0.3, 0.7, 0.9, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(11, 0, 14.9, 3, 1, 0.1, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(13.7, 0, 14, 0.3, 0.7, 0.9, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(11.3, 0, 14, 2.4, 0.3, 0.9, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
// Stairs
cr_addBlock(17.2, 0, 4, 1.4, 1, 1.4, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(17.2, 0, 5.4, 1.4, 0.8, 0.5, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(17.2, 0, 5.9, 1.4, 0.6, 0.5, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(17.2, 0, 6.4, 1.4, 0.4, 0.5, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(17.2, 0, 6.9, 1.4, 0.2, 0.5, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(18.6, 0, 4, 0.5, 1.2, 1.4, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(19.1, 0, 4, 0.5, 1.4, 1.4, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(19.6, 0, 4, 0.5, 1.6, 1.4, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(20.1, 0, 4, 0.5, 1.8, 1.4, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
// Sofa 21 8
cr_addBlock(21.1, 0, 8, 0.9, 0.7, 0.3, [9], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(21.1, 0, 10.7, 0.9, 0.7, 0.3, [9], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(21, 0, 8, 0.1, 1, 3, [9], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(21.1, 0, 8.3, 0.9, 0.3, 2.4, [9], cr_e1m1Walls, cr_e1m1Planes, 0);
// Sofa 23 13
cr_addBlock(23, 0, 13, 0.3, 0.7, 0.9, [21], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23, 0, 13.9, 2, 1, 0.1, [21], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(24.7, 0, 13, 0.3, 0.7, 0.9, [21], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23.3, 0, 13, 1.4, 0.3, 0.9, [21], cr_e1m1Walls, cr_e1m1Planes, 0);
// Coffee Table 23 8
cr_addBlock(23, 0.3, 8, 1, 0.1, 3, [22], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(23, 0, 8, 0.1, 0.3, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23.9, 0, 8, 0.1, 0.3, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23, 0, 10.9, 0.1, 0.3, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23.9, 0, 10.9, 0.1, 0.3, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
// TV 26, 8
cr_addBlock(26.5, 0.8, 9, 0.1, 0.7, 1, [24, 24, 24, 23, 24, 24], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(26.3, 0.7, 9.2, 0.4, 0.05, 0.6, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26.6, 0.75, 9.45, 0.1, 0.3, 0.1, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
// Bookshelf
cr_addBlock(26.5, 0, 5, 0.5, 1.5, 2, [22, 22, 22, 25, 22, 22], cr_e1m1Walls, cr_e1m1Planes, 0);
// Living room desk
cr_addBlock(24, 0.5, 4, 2, 0.1, 1, [22], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(24, 0, 4, 0.1, 0.5, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(25.9, 0, 4, 0.1, 0.5, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(24, 0, 4.9, 0.1, 0.5, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(25.9, 0, 4.9, 0.1, 0.5, 0.1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
// Living room Studio chair
cr_addBlock(24.75, 0.4, 5, 0.5, 0.1, 0.5, [24], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(24.75, 0.6, 5.5, 0.5, 0.5, 0.1, [24], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(24.95, 0.4, 5.5, 0.1, 0.2, 0.1, [24], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(24.95, 0, 5.2, 0.1, 0.4, 0.1, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(24.95, 0, 5, 0.1, 0.1, 0.5, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(24.75, 0, 5.2, 0.5, 0.1, 0.1, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
//Living room Computer
cr_addBlock(24.5, 0.7, 4.2, 1, 0.7, 0.1, [24,24,23,24,24,24], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(24.7, 0.6, 4.05, 0.6, 0.05, 0.4, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(24.95, 0.6, 4.1, 0.1, 0.3, 0.1, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(25.65, 0.6, 4.2, 0.3, 0.6, 0.6, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
//Bathroom
cr_addBlock(25.5, 0, 1.5, 1.5, 1.5, 0.2, [2], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(25.5, 0, 0, 0.2, 0.2, 1.5, [2], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23.2, 0, 2.8, 1, 0.7, 1, [26,26,26,26,27,26], cr_e1m1Walls, cr_e1m1Planes, 0);
// 2nd Floor
// Bedroom 1
// Bed
cr_addBlock(26, 2, 9.6, 1, 1, 0.2, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26, 2, 7.4, 1, 0.7, 0.2, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26, 2.2, 7.6, 1, 0.4, 2, [9], cr_e1m1Walls, cr_e1m1Planes, 0);
// Wardrobe
cr_addBlock(23, 2, 9.3, 2, 1.5, 0.5, [30, 22, 22, 22, 22, 22, 0], cr_e1m1Walls, cr_e1m1Planes, 0);
// Desk
cr_addBlock(26, 2.5, 4.5, 1, 0.2, 2, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26, 2, 4.5, 0.2, 0.5, 0.2, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26.8, 2, 4.5, 0.2, 0.5, 0.2, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26, 2, 6.3, 0.2, 0.5, 0.2, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(26.8, 2, 6.3, 0.2, 0.5, 0.2, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
// Chair
cr_addBlock(25.5, 2, 5.15, 0.2, 1, 0.7, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(25.7, 2, 5.15, 0.5, 0.5, 0.1, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(25.7, 2, 5.75, 0.5, 0.5, 0.1, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(25.7, 2, 5.25, 0.5, 0.3, 0.5, [20], cr_e1m1Walls, cr_e1m1Planes, 0);
// Bedroom 2
// Bed
cr_addBlock(21.2, 2, 14, 0.2, 1, 1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23.4, 2, 14, 0.2, 0.7, 1, [22], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(21.4, 2.2, 14, 2, 0.4, 1, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
// Wardrobe
cr_addBlock(24, 2, 14.5, 2, 1.4, 0.5, [30, 22, 22, 22, 22, 22, 0], cr_e1m1Walls, cr_e1m1Planes, 0);
// Drawer
cr_addBlock(23, 2, 10, 2, 0.7, 1, [19, 19, 18, 19, 19, 19, 0], cr_e1m1Walls, cr_e1m1Planes, 0);
// TV
cr_addBlock(23.5, 2.8, 10.5, 1, 0.7, 0.1, [24,24,23,24,24,24], cr_e1m1Walls, cr_e1m1Planes, 1);
cr_addBlock(23.7, 2.7, 10.35, 0.6, 0.05, 0.4, [24], cr_e1m1Walls, cr_e1m1Planes, 0);
cr_addBlock(23.95, 2.7, 10.4, 0.1, 0.3, 0.1, [24], cr_e1m1Walls, cr_e1m1Planes, 0);

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
  if (cr_cameraState === 1) {
    cr_cameraHeight = cr_Math.max(cr_cameraHeight - 0.008, 0.1);
    cr_cameraView = cr_updateMatrix([-cr_cameraPosition[0], -cr_cameraPosition[1]-cr_cameraHeight, -cr_cameraPosition[2]], cr_cameraRotation);
    return;
  }

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

  if (M != 0 && !cr_doesCollidesWithWalls(cr_cameraPosition, M * S * L, M * C * L) && !cr_doesCollidesWithEnemy(cr_targetPosition, 0) && !cr_doesCollidesWithProps(cr_targetPosition, 0)) {
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
  cr_cameraView = cr_updateMatrix([-cr_cameraPosition[0], -cr_cameraPosition[1]-cr_cameraHeight, -cr_cameraPosition[2]], cr_cameraRotation);

  if (cr_keys["KeyZ"] === 1 && !cr_cameraAttackDelay) {
    cr_cameraAttackDelay = 20;
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
  cr_canvas2D.width = cr_Math.floor(cr_width/4);
  cr_canvas2D.height = cr_Math.floor(cr_height/4);

  cr_ctx2D = cr_canvas2D.getContext("2d");
  cr_ctx2D.imageSmoothingEnabled = 0;
}

function cr_parsePixels(cr_sprite) {
  const cr_pixels = [];

  for (let I=0;I<cr_sprite[2].length;I++) {
    if (cr_sprite[2][I] === ' ') 
      cr_pixels.push(0, 0, 0, 0);
    else 
      cr_pixels.push(...cr_palette[cr_paletteAscii.indexOf(cr_sprite[2][I])], 255);
  }

  return new Uint8ClampedArray(cr_pixels);
}

function cr_loadTextures() {
  for (let J=0;J<cr_img.length;J++) {
    const cr_pixels = cr_parsePixels(cr_img[J]),
    A = 3553;

    cr_textures[J] = cr_gl.createTexture();
    cr_gl.bindTexture(A, cr_textures[J]);
    cr_gl.texImage2D(A, 0, 6408, cr_img[J][0], cr_img[J][1], 0, 6408, 5121, cr_pixels);
    cr_gl.texParameteri(A, 10240, 9728);
    cr_gl.texParameteri(A, 10241, 9728);
    if (cr_img_clamp_to_edges[J]) {
      cr_gl.texParameteri(A, 10242, 33071);
      cr_gl.texParameteri(A, 10243, 33071);
    }
  }
}

function cr_loadTextures2D() {
  for (let I=0;I<4;I++) {
    const cr_pixels = cr_parsePixels(cr_img2D[I]);
    cr_textures2D.push(new ImageData(cr_pixels, cr_img2D[I][0], cr_img2D[I][1]));
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
    if (P[1] >= cr_walls[J][1] - 0.21) continue;
    if (P[1]+1 <= cr_walls[J][0]) continue;

    for (let I = 3; I < cr_walls[J].length; I+=2) {
      const cr_wallx = -(cr_walls[J][I+3] - cr_walls[J][I+1]),
      cr_wallz = cr_walls[J][I+2] - cr_walls[J][I],
      cr_dot = cr_wallx * X + cr_wallz * Y;

      if (cr_dot >= 0) continue;

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
  Z2 = P[2] + S,
  
  cr_enemy = cr_doesCollidesWithEnemy(P, 0, 1);
  cr_enemy = !cr_enemy && cr_doesCollidesWithProps(P, 1);

  if (!cr_isCeiling && cr_enemy && cr_enemy.cr_position[1] + 0.8 <= P[1]) {
    cr_result = cr_enemy.cr_position[1] + 0.8;
  }

  for (let I=0;I<cr_planes.length;I+=7) {
    const cr_isFloor = cr_planes[I + 6] === 1;
    if (!(cr_isFloor ^ cr_isCeiling)) continue;
    if (X2 < cr_planes[I+2] || X1 > cr_planes[I+4]) continue;
    if (Z2 < cr_planes[I+3] || Z1 > cr_planes[I+5]) continue;
    (cr_planes[I] >= P[1] && cr_isCeiling) && (cr_result = cr_Math.min(cr_planes[I], cr_result));
    (cr_planes[I] <= P[1] + 0.21 && !cr_isCeiling) && (cr_result = cr_Math.max(cr_planes[I], cr_result));
  }

  return cr_result;
}

// moves the entity to it's floor position
function cr_updateGravity(P, T) {
  if (P[1] < T) {
    P[1] = cr_Math.min(P[1] + 0.1, T);
    P[3] = 0;
  }else if (P[1] > T) {
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
function cr_doesCollidesWithEnemy(P, cr_self, cr_2d = 0) {
  for (let I=0;I<cr_enemies.length;I++) {
    const cr_enemy = cr_enemies[I];
    if (cr_enemy === cr_self || cr_enemy.cr_state === 3) continue;
    if (!cr_2d && P[1] >= cr_enemy.cr_position[1] + 0.8) continue;
    if (!cr_2d && P[1]+1 < cr_enemy.cr_position[1]) continue;

    const cr_distance = (P[0] - cr_enemy.cr_position[0]) ** 2 + (P[2] - cr_enemy.cr_position[2]) ** 2;
    if (cr_distance <= 1) return cr_enemy;
  }
  return 0;
}

// Check for collisions with props
function cr_doesCollidesWithProps(P, cr_2d = 0) {
  for (let I=0;I<cr_props.length;I++) {
    const cr_prop = cr_props[I];
    if (!cr_prop.cr_isSolid) continue; 
    if (!cr_2d && P[1] >= cr_prop.cr_position[1] + 0.8) continue;
    if (!cr_2d && P[1]+1 < cr_prop.cr_position[1]) continue;

    const cr_distance = (P[0] - cr_prop.cr_position[0]) ** 2 + (P[2] - cr_prop.cr_position[2]) ** 2;
    if (cr_distance <= 1) return cr_prop;
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

  const cr_uniformTime = cr_getUniformLocation(cr_program, "u_tm");
  //cr_gl.uniform2f(cr_uniformTime, cr_geometry.cr_textureIndex === 8 ? cr_time * 0.3 : 0, 0);
  cr_gl.uniform2f(cr_uniformTime, 0, 0);

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
    cr_texWidth = cr_img[cr_roomWalls[2]][0],
    cr_texHeight = cr_img[cr_roomWalls[2]][1],
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
      TX = (cr_Math.sqrt((X2 - X1) ** 2 + (Z2 - Z1) ** 2)) / (cr_texWidth / 16);
      TY = (cr_roomWalls[1] - cr_roomWalls[0]) / (cr_texHeight / 16);

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
  for (let I=0;I<cr_planes.length;I+=7) {
    const cr_geometry = {},
    cr_isFloor = cr_planes[I + 6] === 1;
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

    cr_geometry.cr_indices = cr_isFloor ? [
      0, 1, 2,
      2, 1, 3
    ] : [
      0, 2, 1,
      2, 3, 1
    ];

    cr_bindGeometry(cr_geometry);
    cr_geometries.push(cr_geometry);
  }
}

function cr_createBillboard(W, H, T, UV) {
  const cr_geometry = {},
  cr_HW = W/2;

  cr_geometry.cr_vertices = [
    0, 0, cr_HW,  UV[0], UV[3],
    0, 0, -cr_HW,  UV[2], UV[3],
    0, H, cr_HW, UV[0], UV[1],
    0, H, -cr_HW,  UV[2], UV[1]
  ];

  cr_geometry.cr_indices = [
    0, 1, 2,
    2, 1, 3
  ];

  cr_geometry.cr_textureIndex = T;

  cr_bindGeometry(cr_geometry);

  return cr_geometry;
}

function cr_buildLevelProps() {
  for (let I = 0; I < cr_levelProps.length; I += 4) {
    cr_props.push({
      cr_position: [cr_levelProps[I + 1], cr_levelProps[I + 2], cr_levelProps[I + 3]],
      cr_matriz: cr_matTranslate(cr_levelProps[I + 1], cr_levelProps[I + 2], cr_levelProps[I + 3]),
      cr_geometry: cr_createBillboard(1, 1, 28, cr_propsUVs[I]),
      cr_isSolid: cr_levelProps[I + 4] === 1
    });
  }
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
  if (cr_length <= 1.5) {
    cr_cameraHurt = 10;
    if (--cr_cameraHealth <= 0) cr_cameraState = 1;
  }
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
      if ((cr_enemy.cr_frame<<0) === 2 && cr_previousFrame == 1) {
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
      cr_enemy.cr_attackCooldown = 60;
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
  if (cr_enemy && cr_enemy.cr_state != 2) {
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
  const cr_now = Date.now() - cr_lastTime,
  cr_delta = cr_now / 1000;
  cr_lastTime = Date.now();

  cr_time += cr_delta;

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
      cr_ctx2D.putImageData(cr_textures2D[2], 85, 89); 
      cr_cameraAttackDelay--;
    } 
    else {
      (!cr_cameraIsJumping) && cr_ctx2D.putImageData(cr_textures2D[0], 90+S*8, 90+cr_Mathabs(S)*4);
      (cr_cameraIsJumping) && cr_ctx2D.putImageData(cr_textures2D[1], 86, 86);
    }
    if (--cr_cameraHurt > 0){
      cr_ctx2D.fillStyle="rgba(255,0,68,0.5)";
      cr_ctx2D.fillRect(0, 0, cr_width, cr_height);
      cr_ctx2D.fillStyle="white";
    }
    for (I=0;I<cr_cameraHealth;I++) {
      cr_ctx2D.putImageData(cr_textures2D[3], 1 + I * 16, 1);
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

  // Update the props
  for (I=0;I<cr_props.length;I++) {
    cr_props[I].cr_matriz = cr_updateMatrix(cr_props[I].cr_position, -cr_cameraRotation+cr_pi_2, 0);
    cr_renderGeometry(cr_props[I].cr_geometry, cr_props[I].cr_matriz);
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
  cr_lastTime = Date.now();

  cr_initEngine();
  cr_initEngine2D();
  cr_loadTextures();
  cr_loadTextures2D();
  cr_buildRoomGeometry();
  cr_buildPlanesGeometry();
  cr_buildLevelProps();
  //cr_createEnemy(9,0,9,3,3);
  cr_update();
}

cr_main();