//交叉的道路生成桥梁

//0数据准备
//1找到重叠位置
//2生成最外层桥梁条带
//3贴图

// get_twoLineConflict(twoRoad, 0.0015)
//数据获取和准备
function getData(data) {
  let features0 = data.features[0]
  let features1 = data.features[1]
  var pts0 = features0.geometry.coordinates[0]
  var pts1 = features1.geometry.coordinates[0]

  var vec0 = []
  var vec1 = []

  for (var j = 0; j < pts0.length; j++) {
    var pt = new Point(pts0[j][0], pts0[j][1], j) //id也添加进去
    vec0.push(pt)
  }
  for (j = 0; j < pts1.length; j++) {
    var pt = new Point(pts1[j][0], pts1[j][1], j) //id也添加进去
    vec1.push(pt)
  }

  // vec0 = transform2(vec0, bound)
  // vec1 = transform2(vec1, bound)
  console.log(vec0)
  console.log(vec1)

  return { vec0, vec1 }
}

//判断重叠位置
function get_twoLineConflict(roads, width) {
  var obj = getData(roads)
  var trianglesOBJ = dealData(obj.vec0, obj.vec1, width) //计算叠置的三角形
  draw_debug_riverNet(trianglesOBJ)
  // return trianglesOBJ
}

//para:(x,y)array
function dealData(road1, road2, width) {
  //计算外接矩形

  var bound = {
    maxX: 110.5204,
    minX: 110.4636,
    maxY: 29.1147,
    minY: 29.05,
  }
  //坐标转换(x,y)->Point,同时添加id
  // 坐标转换至（-1,1）
  var roadVecs1 = transform2(road1, bound) //(-1,1)之间的坐标
  var roadVecs2 = transform2(road2, bound) //(-1,1)之间的坐标

  let centralLine1 = toXYArray(roadVecs1)
  let centralLine2 = toXYArray(roadVecs2)
  let centralLine = [centralLine1, centralLine2]

  //原始剖分三角形
  let pos = insertPts(road1, width)
  var originStrip1 = convertCor2(
    toXYArray(ptsToTriangles(pos.pts1, pos.pts2)),
    bound
  )
  pos = insertPts(road2, width)
  var originStrip2 = convertCor2(
    toXYArray(ptsToTriangles(pos.pts1, pos.pts2)),
    bound
  )
  let originStrip = [originStrip1, originStrip2]

  // //0曲线插值，顶点->三角形条带
  var position = insertPts(roadVecs1, width, false) //不渐变宽度
  var roadStrip1 = get_Tris(position.pts1, position.pts2)
  position = insertPts(roadVecs2, width, false) //不渐变宽度
  var roadStrip2 = get_Tris(position.pts1, position.pts2)

  //1计算相邻两条等高线之间是否有叠置
  var overlapTris = overLapTriInDifferentline(roadStrip1, roadStrip2)

  // var overlap_Tris1 = obj.triangleStrip1, //叠置的三角形
  //   overlap_Tris2 = obj.triangleStrip2 //叠置的三角形

  // overlap_Tris1 = Tris_to_XYarr(overlap_Tris1)
  // overlap_Tris2 = Tris_to_XYarr(overlap_Tris2)

  // let overlap_Tris = [overlap_Tris1, overlap_Tris2]
  return { centralLine, originStrip, overlapTris }
}

function convertCor2(xyArr, bound) {
  let arr = []
  for (var i = 0; i < xyArr.length; i = i + 2) {
    let x =
      ((2 * (xyArr[i] - bound.minX)) / (bound.maxX - bound.minX) - 1) * 0.95
    arr.push(x)
    // console.log(xyArr[i + 1])
    let y =
      ((2 * (xyArr[i + 1] - bound.minY)) / (bound.maxY - bound.minY) - 1) * 0.95
    arr.push(y)
  }
  return arr
}

//两条直线之间存在叠置的情况
function overLapTriInDifferentline(triangleStrip1, triangleStrip2) {
  var flag = false
  var overlap_Tris1 = [],
    overlap_Tris2 = []
  var tags = []
  for (var i = 0; i < triangleStrip1.length; i++) {
    var m = 0
    for (var j = 0; j < triangleStrip2.length; j++) {
      flag = Trianglesoverlap(triangleStrip1[i], triangleStrip2[j])
      if (flag) {
        console.log('俩曲线有冲突')
        m++
        tags.push(i)
      }
      overlap_Tris2.push(triangleStrip2[j])
    }
    //重复的三角形只存一次
    if (m > 0) {
      overlap_Tris1.push(triangleStrip1[i])
    }
  }
  return [Tris_to_XYarr(overlap_Tris1), Tris_to_XYarr(overlap_Tris2)]
}

//找到数组中最大值和最小值
function get_min_max(arr) {
  var min = 1e3,
    max = -1e3
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i]
    }
    if (arr[i] > max) {
      max = arr[i]
    }
  }
  return { minindex: min, maxindex: max }
}

/*
//同时绘制河网结构
//绘制原始剖分线、debug三角网、重叠三角形
function draw_debug_riverNet(gl, obj) {
  let centralLine = obj.centralLine
  let originStrip = obj.originStrip
  let overlapTris = obj.overlapTris
  let debugTriNet = obj.debugTriNet

  // var gl = getContextgl5()
  gl.clearColor(0.95, 0.95, 0.95, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  var program = createProgram(gl, v_Shader, f_Shader)
  gl.useProgram(program.program)

  //绘制原始剖分三角形
  gl.uniform4fv(program.u_color, [0.0, 0.2, 1.0, 0.7])
  for (let i = 0; i < originStrip.length; i++) {
    var riverBuffer = createBuffer(gl, new Float32Array(originStrip[i]))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    var n = originStrip[i].length / 2
    gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
  }

  //绘制中心线
  gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
  for (let i = 0; i < centralLine.length; i++) {
    var riverBuffer = createBuffer(gl, new Float32Array(centralLine[i]))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = centralLine[i].length / 2
    gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制中心线
  }

  // 绘制变色重叠三角形
  gl.uniform4fv(program.u_color, [1.0, 0.0, 0.0, 1.0])
  for (let i = 0; i < overlapTris.length; i++) {
    if (overlapTris[i].length) {
      var riverBuffer = createBuffer(gl, new Float32Array(overlapTris[i]))
      bindAttribute(gl, riverBuffer, program.a_Position, 2)
      n = overlapTris[i].length / 2
      gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
    }
  }

  // //绘制三角网
  gl.uniform4fv(program.u_color, [0.8, 0.0, 0.0, 0.8])
  for (let i = 0; i < debugTriNet.length; i++) {
    var riverBuffer = createBuffer(gl, new Float32Array(debugTriNet[i]))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    gl.drawArrays(gl.LINE_LOOP, 0, 3) //绘制DEBUG三角网
  }
}
*/
