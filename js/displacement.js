//空间叠置的冲突移位
//找到数组中需处理的首尾点(是否有多个需要处理的区间,假设只有一个)
//para:[{data:Point,tag:true/false/start/end},……]
function getStartEnd(seg) {
  var pts = []
  for (var i = 0; i < seg.length; i++) {
    if (seg[i].tag == true) {
      pts.push(seg[i])
    } else {
      break
    }
  }
  pts[0].tag = 'start'
  pts[pts.length - 1].tag = 'end'
  return pts
}

//计算两点确定的直线参数
function getLinePara(pt1, pt2) {
  let A = (pt1.y - pt2.y) / (pt2.x - pt1.x)
  let B = 1
  let C = -pt2.y - (pt2.x * (pt1.y - pt2.y)) / (pt2.x - pt1.x)
  return { A, B, C }
}

//计算点到直线的垂线和垂足,p3到p1p2直线的垂足坐标
function getFootPoint(p1, p2, p3) {
  let foot = new Point()
  let dx = p1.x - p2.x
  let dy = p1.y - p2.y

  let u = (p3.x - p1.x) * dx + (p3.y - p1.y) * dy //三点共线
  u = u / (dx * dy + dy * dy)

  foot.x = p1.x + u * dx
  foot.y = p1.y + u * dy

  return foot
}

//根据percent计算中间点的坐标
function getCenter(pt1, pt2, percent) {
  //pt1为原始点
  let center = new Point() //中间点的坐标

  dx = pt2.x - pt1.x
  dy = pt2.y - pt1.y

  center.x = percent * dx + pt1.x
  center.y = percent * dy + pt1.y

  return center
}

//传入折线段，移位百分比,得到新的折线段,
function getNewLine(array, percent) {
  //1获取移位折线段
  let arr = getStartEnd(array)
  //2 计算新的坐标点
  let pt1 = arr[0].point //起点
  let pt2 = arr[arr.length - 1].point //终点

  let newArr = []
  for (var i = 0; i < arr.length; i++) {
    let foot = getFootPoint(pt1, pt2, arr[i].point)
    let center = getCenter(arr[i].point, foot, percent)
    newArr.push(center)
  }
  console.log(newArr)
  return newArr
}

//生成一条曲线y = x*x
function init_Line() {
  let pts = []
  let points = []
  for (var i = -0.3; i < 1; i = i + 0.05) {
    let y = i * i
    let point = new Point(i, y)
    points.push(point)
    let obj = { point, tag: true }
    pts.push(obj)
  }
  console.log(pts)
  return { pts, points }
}

//绘制
function drawDisplacement(array1, array2) {
  let gl = getGL(window, { preserveDrawingBuffer: false, fixretina: false })
  let program = createProgram(gl, v_Shader, f_Shader)
  gl.useProgram(program.program)

  gl.uniform4fv(program.u_color, [0, 0, 1, 1])
  var riverBuffer = createBuffer(gl, new Float32Array(array1))
  bindAttribute(gl, riverBuffer, program.a_Position, 2)
  var n = array1.length / 2
  gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制多个三角形

  //array2
  gl.uniform4fv(program.u_color, [1, 0, 0, 1])
  var riverBuffer = createBuffer(gl, new Float32Array(array2))
  bindAttribute(gl, riverBuffer, program.a_Position, 2)
  var n = array2.length / 2
  gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制线条
}

function test() {
  let initPts = init_Line().pts
  let points = init_Line().points
  let newPts = getNewLine(initPts, 0.5)
  points = toXYArray(points)
  newPts = toXYArray(newPts)
  console.log(points)
  console.log(newPts)

  // 绘制原始线和新的线
  drawDisplacement(points, newPts)
}

test()

//采用移位的方式去处理冲突
function detect_displacement() {}

//注意这是与前面重合的函数，需进行修改得到计算的坐标
// 绘制，检测，重绘,para:points:Point类
function draw_detect(gl, points, width) {
  //计算了很多遍插值
  let centralLine = toXYArray(transform1(points)) //坐标转换

  let originStrip = draw_line_Tris(points, width) //原始剖分三角形坐标

  let obj = draw_Triobjs(points, width) // 重叠三角形坐标
  let overlapTris = obj.array

  let newCentralLine = toXYArray(transform1(obj.newPts)) //已经删除处理后的坐标

  let debugTriNet = draw_debug_Trinet(points, width) //debug三角网坐标

  let newTriStrip = draw_line_Tris(obj.newPts, width) //删除重叠部分三角形的坐标条带

  /*
    let centralLine = toXYArray(points);
*/
  // 绘制
  // return {
  //   centralLine,
  //   originStrip,
  //   overlapTris,
  //   newCentralLine,
  //   debugTriNet,
  //   newTriStrip,
  // }
  draw_three_objs(
    gl,
    centralLine,
    originStrip,
    overlapTris,
    newCentralLine,
    debugTriNet,
    newTriStrip
  )
}
