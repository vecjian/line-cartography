const V_shader = `
    attribute vec4 a_pos;
    void main(){
        gl_Position = a_pos;
    }
`
const F_shader = `
    precision highp float;  
    uniform float u_halfHeight;
    uniform float u_A;
    uniform float u_B;
    uniform float u_C;
    float getDis(float x, float y) {
        return abs(x * u_A + y * u_B + u_C) / sqrt(u_A * u_A + u_B * u_B);
    }
    void main(){
        float dis = getDis(gl_PointCoord[0], gl_PointCoord[1]);
        float percent = 0.0;
        if(dis > u_halfHeight){
            percent = (2.0 * u_halfHeight - dis) / u_halfHeight;
        }else {
            percent = dis / u_halfHeight;
        }
        gl_FragColor = vec4(1.0, 0.0, 0.0, percent);
    }
`

const Bounds = [-0.2, -0.1, -0.1, 0.2, 1, 0, 1, 0.5]
// const Bounds = [-0.3, -0.2, -0.2, 0.2, 0.3, -0.2, 0.2, 0.2]

function getHalfHeight(bounds) {
  // let [x1, y1, x2, y2, x3, y3, x4, y4] = bounds;
  let [x1, y1, x2, y2, x3, y3] = bounds
  let A = (y3 - y1) / (x1 - x3)
  let B = 1
  let C = -y1 - (x1 * (y3 - y1)) / (x1 - x3)
  let dis = Math.abs(A * x2 + B * y2 + C) / Math.sqrt(A * A + B * B)
  return { A, B, C, halfHeight: dis / 2 }
}

function init() {
  let gl = getGL(window, { preserveDrawingBuffer: true })
  let program = createProgram(gl, V_shader, F_shader)
  let { A, B, C, halfHeight } = getHalfHeight(Bounds)
  console.log(A, B, C, halfHeight)
  gl.useProgram(program.program)

  let vBuffer = createBuffer(gl, new Float32Array(Bounds))
  bindAttribute(gl, vBuffer, program.a_pos, 2)
  gl.uniform1f(program.u_halfHeight, halfHeight)
  gl.uniform1f(program.u_A, A)
  gl.uniform1f(program.u_B, B)
  gl.uniform1f(program.u_C, C)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

// init();
