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

// //计算两点确定的直线参数
// function getLinePara(pt1, pt2) {
//   let A = (pt1.y - pt2.y) / (pt2.x - pt1.x)
//   let B = 1
//   let C = -pt2.y - (pt2.x * (pt1.y - pt2.y)) / (pt2.x - pt1.x)
//   return { A, B, C }
// }

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
  center.id = pt1.id

  return center
}

//传入折线段，移位百分比,得到新的折线段,
function getNewLine(arr, percent) {
  //1获取移位折线段
  // let arr = getStartEnd(array)
  //2 计算新的坐标点
  let pt1 = arr[0] //起点
  let pt2 = arr[arr.length - 1] //终点

  let newArr = []
  for (var i = 0; i < arr.length; i++) {
    let foot = getFootPoint(pt1, pt2, arr[i])
    let center = getCenter(arr[i], foot, percent)
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
    // let obj = { point, tag: true }
    pts.push(obj)
  }
  return pointspoints
}

//绘制
function drawDisplacement(array1, array2) {
  let gl = getGL(window, { preserveDrawingBuffer: false, fixretina: false })
  let program = createProgram(gl, v_Shader, f_Shader)
  gl.useProgram(program.program)

  //设置缩放参数
  gl.uniform1f(program.u_Scale, 1.0)

  //array1：原始坐标
  gl.uniform4fv(program.u_color, [0, 0, 1, 1])
  var riverBuffer = createBuffer(gl, new Float32Array(array1))
  bindAttribute(gl, riverBuffer, program.a_Position, 2)
  var n = array1.length / 2
  gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制多个三角形

  //array2：移位后坐标
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

// detect_displacement_draw(0.5, 0.0015)
// test()

//采用移位的方式去处理冲突
//检测+移位
function detect_displacement_draw(gl, points, percent, width) {
  //1 获取折线点的坐标points

  //2 检测并标记冲突位置+移位
  //3 对冲突进行移位，得到新的折现坐标串
  let obj = sign_Overlap_Tris(points, percent, width)
  // let overlapTris = (obj.array = obj.overlap_Tris)
  // let newPts = obj.newPts
  //4 生成原来的+新的坐标串
  let centralLine = toXYArray(transform1(points)) //坐标转换

  let originStrip = draw_line_Tris(points, width) //原始剖分三角形坐标

  // let newCentralLine = toXYArray(transform1(newPts)) //已经删除处理后的坐标

  let debugTriNet = draw_debug_Trinet(points, width) //debug三角网坐标

  // let newTriStrip = draw_line_Tris(newPts, width) //删除重叠部分三角形的坐标条带

  //4 绘制新的坐标
  draw_three_objs(
    gl,
    centralLine,
    originStrip,
    // overlapTris,
    // newCentralLine,
    debugTriNet
    // newTriStrip
  )
  // clearBoundary()
}

// 在一条三角形条带中，遍历每个三角形，比较并标记
// para:   triangles={{p1,p2,p3}，{}，{}，……},为Triangle对象数组
function sign_Overlap_Tris(points, percent, width) {
  console.log(points)
  let pos = insertPts(points, width)
  let triangles = get_Tris(pos.pts1, pos.pts2) //得到所有三角形串坐标

  let newPts = points,
    overlap_Tris = []
  let len = triangles.length
  // 保存找到的有位置重叠的三角形
  var flag = false
  for (var i = 0; i < len; i++) {
    //triangles[j]不与前面的三角形发生重叠
    for (var j = i + 1; j < len && !triangles[j].tag; j++) {
      // 判断两个三角形的位置关系
      flag = Trianglesoverlap(triangles[i], triangles[j])
      // flag=true,有位置重叠
      if (flag) {
        console.log('有冲突')
        triangles[i].tag = true
        triangles[j].tag = true
        // 保存两个重叠的三角形
        overlap_Tris.push(triangles[i])
        overlap_Tris.push(triangles[j])
        //一边计算，一边替换
        newPts = replacePts(percent, newPts, triangles[i].id, triangles[j].id) //从更新后的数组进行替代
      }
    }
  }
  if (overlap_Tris.length < 1) {
    console.log('折线没有重叠部分')
    overlap_Tris.length = 0 //清空数组
  }
  return { overlap_Tris, newPts }
}

//计算截取的折线段，获取新的替代片段
function replacePts(percent, points, start, end) {
  let old = points
  let pts = []
  // if (end < points.length) {
  // pts = points.slice(start, end + 1) //截取需要进行移位的部分
  // } else {
  pts = points.slice(start, end) //截取需要进行移位的部分
  // }
  let newPts = getNewLine(pts, percent)
  for (var i = 0; i < pts.length; i++) {
    old[start + i] = newPts[i]
  }
  console.log(old)
  return old //替代后的坐标串
}
