//着色器设计库

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
    // 计算遍历的像素点到线的距离
    float getDis(float x, float y) {
        return abs(x * u_A + y * u_B + u_C) / sqrt(u_A * u_A + u_B * u_B);
    }
    void main(){
        float x = 2.0 * (gl_FragCoord[0] / 800.0) - 1.0;
        float y = (gl_FragCoord[1] / 600.0 - 0.5) / 0.5;
        float dis = getDis(x, y);
        float percent = 0.0;
        
        // //跨区域色带
        // if( dis <1.05*u_halfHeight && dis>0.95*u_halfHeight){
        //   gl_FragColor =vec4(0.0,0.0,0.0,1.0) ;
        // } else if(dis>0.5*u_halfHeight&&dis< 1.5*u_halfHeight){
        //   gl_FragColor = vec4(0.65, 0.4, 0.65, 1.0);
        // }else{
        //   gl_FragColor =   vec4(0.8, 0.6, 0.8, 1.0);
        // }

        // //跨区域色带
        // if( dis <1.05*u_halfHeight && dis>0.95*u_halfHeight){
        //   gl_FragColor =vec4(0.0,0.0,0.0,1.0) ;
        // } else if(dis>0.5*u_halfHeight&&dis< 1.5*u_halfHeight){
        //   gl_FragColor = vec4(0.6, 0.6, 0.6, 1.0);
        // }else{
        //   gl_FragColor =   vec4(0.75, 0.75, 0.75, 1.0);
        // }

        //三线道路
        // if( dis <1.05*u_halfHeight && dis>0.95*u_halfHeight){
        //   gl_FragColor =vec4(0.0,0.0,0.0,1.0) ;
        // } else if(dis>0.25*u_halfHeight&&dis< 1.75*u_halfHeight){
        //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        // }else{
        //   gl_FragColor =   vec4(0.0, 0.0, 0.0, 1.0);
        // }
    
        //跨区域连续色带
        if(dis>0.0 && dis<0.45*u_halfHeight*2.0){
            percent = ( u_halfHeight - dis) / u_halfHeight;
        }
        else if( dis > 0.55*u_halfHeight*2.0 && dis<u_halfHeight*2.0){
          percent = ( dis-2.0*u_halfHeight) / u_halfHeight;
        }
        gl_FragColor = vec4(0.0, 0.0, 0.0, percent);


        if(dis > u_halfHeight){
          percent = (2.0 * u_halfHeight - dis) / u_halfHeight;
          // percent = 0.7;
      }else {
          percent = dis / u_halfHeight;
          // percent = 1.0;
      }
      gl_FragColor = vec4(0.0, 0.0, 0.0, percent);
      // gl_FragColor = vec4(1.0, 0.0, 0.0,1.0);
    }
`

// const Bounds = [-0.5, 0.0, -0.5, 0.4, -0.2, 0.2, -0.2, -0.1, 1, 0.4, 1, 0.7];
const Bounds = [-0.3, -0.2, -0.3, 0.2, 0.3, -0.2, 0.3, 0.2]
const Bounds1 = [
  -0.3,
  -0.2,
  -0.3,
  0.2,
  0.3,
  -0.2,
  0.3,
  0.2,
  0.48,
  -0.4,
  0.48,
  0.0,
]

function getHalfHeight(bounds) {
  let [x1, y1, x2, y2, x3, y3, x4, y4] = bounds
  let A = (y3 - y1) / (x1 - x3)
  let B = 1
  let C = -y1 - (x1 * (y3 - y1)) / (x1 - x3)
  let dis = Math.abs(A * x2 + B * y2 + C) / Math.sqrt(A * A + B * B)
  return { A, B, C, halfHeight: dis / 2 }
}

function init() {
  let gl = getGL(window, { preserveDrawingBuffer: false, fixretina: false })
  let program = createProgram(gl, V_shader, F_shader)
  let { A, B, C, halfHeight } = getHalfHeight(Bounds)
  // console.log(A, B, C, halfHeight);
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
// multiLine(Bounds)

// 测试折线段可否用着色器实现
function multiLine(Bounds2) {
  let gl = getGL(window, { preserveDrawingBuffer: false, fixretina: false })
  let program = createProgram(gl, V_shader, F_shader)

  //每一个四边形单独计算并绘制
  for (var i = 0; i < Bounds2.length - 7; i = i + 4) {
    const bounds = Bounds2.slice(i, i + 8)
    let { A, B, C, halfHeight } = getHalfHeight(bounds)
    // console.log(A, B, C, halfHeight)
    gl.useProgram(program.program)

    let vBuffer = createBuffer(gl, new Float32Array(bounds))
    bindAttribute(gl, vBuffer, program.a_pos, 2)
    gl.uniform1f(program.u_halfHeight, halfHeight)

    gl.uniform1f(program.u_A, A)
    gl.uniform1f(program.u_B, B)
    gl.uniform1f(program.u_C, C)
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
