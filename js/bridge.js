//交叉的道路生成桥梁

//0数据准备
//1找到重叠位置
//2生成最外层桥梁条带
//3贴图???

get_twoLineConflict(twoRoad, 0.0015)
//数据获取和准备
function getData(data) {
  let features0 = data.features[0]
  let features1 = data.features[1]
  // var pts0 = features0.geometry.coordinates[0]
  // var pts1 = features1.geometry.coordinates[0]
  var pts0 = features0.geometry.coordinates
  var pts1 = features1.geometry.coordinates
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

  console.log(vec0)
  console.log(vec1)

  return { vec0, vec1 }
}

//判断重叠位置
function get_twoLineConflict(roads, width) {
  // getMapStructure(twoRoad, false)
  var obj = getData(roads)
  //计算外接矩形
  var bound = {
    maxX: 110.5204,
    minX: 110.4636,
    maxY: 29.1147,
    minY: 29.05,
  }
  var OBJ = dealData(obj.vec0, obj.vec1, width, bound) //计算叠置的三角形
  var gl = getContextgl7()
  draw_bridge(gl, OBJ)
  // return trianglesOBJ
}

//para:(x,y)array
//flag:
function dealData(road1, road2, width, bound, flag) {
  // boundary = bound //给全局变量boundary赋初值
  // console.log(boundary)
  //坐标转换(x,y)->Point,同时添加id
  // 坐标转换至（-1,1）
  var roadVecs1 = transform2(road1, bound) //坐标值在(-1,1)之间
  var roadVecs2 = transform2(road2, bound) //坐标值在(-1,1)之间
  let centralLine1 = toXYArray(roadVecs1)

  let centralLine2 = toXYArray(roadVecs2) //单线状
  let centralLine = [centralLine1, centralLine2] //单线状

  //原始剖分三角形
  let pos1 = insertPts(road1, width)
  // var originStrip1 = convertCor2(
  //     toXYArray(ptsToTriangles(pos1.pts1, pos1.pts2)),
  //     bound
  // )
  let pos2 = insertPts(road2, width)
  // var originStrip2 = convertCor2(
  //     toXYArray(ptsToTriangles(pos2.pts1, pos2.pts2)),
  //     bound
  // )
  // let originStrip = [originStrip1, originStrip2]

  // 0曲线插值，顶点->三角形条带
  var roadStrip1 = get_Tris(pos1.pts1, pos1.pts2)
  var roadStrip2 = get_Tris(pos2.pts1, pos2.pts2)

  // 1计算相邻两条等高线之间是否有叠置
  var overlapTris = overLapTriInDifferentline(roadStrip1, roadStrip2)
  overlapTris[0] = convertCor(overlapTris[0], bound)
  overlapTris[1] = convertCor(overlapTris[1], bound)

  // 2选择是否将重叠部分进行间断绘制
  let idArr1 = overlapTris[2]
  let idArr2 = overlapTris[3]
  let originStrip = []
  if (flag) {
    // let originStrip1 = convertCor(Tris_to_XYarr(replace(roadStrip1,idArr1)),bound)//先删除一条线段的重叠三角形
    let originStrip2 = convertCor(
      Tris_to_XYarr(replace(roadStrip2, idArr2)),
      bound
    )

    let originStrip1 = convertCor(Tris_to_XYarr(roadStrip1), bound)
    // let originStrip2 = convertCor(Tris_to_XYarr(roadStrip2),bound)
    originStrip.push(originStrip1, originStrip2)
  } else {
    let originStrip1 = convertCor(Tris_to_XYarr(roadStrip1), bound)
    let originStrip2 = convertCor(Tris_to_XYarr(roadStrip2), bound)
    originStrip.push(originStrip1, originStrip2)
  }

  return { centralLine, originStrip, overlapTris }
}

//将重叠三角形数组的重叠图元换成-1
function replace(triStrip, tags) {
  let len = tags.length
  let Strip = triStrip.slice(0) //深拷贝，不改变原来的值
  for (var i = 0; i < len; i++) {
    Strip.splice(tags[i], 1, -1)
  }
  return Strip
}

function convertCor2(xyArr, bound) {
  let arr = []
  let scale = Math.max(bound.maxX - bound.minX, bound.maxY - bound.minY)
  for (var i = 0; i < xyArr.length; i = i + 2) {
    let x = (2 * (xyArr[i] - bound.minX)) / scale - 1
    let y = (2 * (xyArr[i + 1] - bound.minY)) / scale - 1
    arr.push(x, y)
    // let x =
    //     ((2 * (xyArr[i] - bound.minX)) / (bound.maxX - bound.minX) - 1) * 0.95
    // arr.push(x)
    //     // console.log(xyArr[i + 1])
    // let y =
    //     ((2 * (xyArr[i + 1] - bound.minY)) / (bound.maxY - bound.minY) - 1) * 0.95
    // arr.push(y)
  }
  return arr
}

//两条直线之间存在叠置的情况
function overLapTriInDifferentline(triangleStrip1, triangleStrip2) {
  var flag = false
  var overlap_Tris1 = [],
    overlap_Tris2 = []
  var tags1 = [],
    tags2 = []
  for (var i = 0; i < triangleStrip1.length; i++) {
    var m = 0
    for (var j = 0; j < triangleStrip2.length; j++) {
      flag = Trianglesoverlap(triangleStrip1[i], triangleStrip2[j])
      if (flag) {
        console.log('俩曲线有冲突')
        m = m + 1
        if (m == 1) {
          tags1.push(triangleStrip1[i].id) //标记三角形的id
        }
        tags2.push(triangleStrip2[j].id)
        overlap_Tris2.push(triangleStrip2[j])
      }
    }
    //重复的三角形只存一次
    if (m > 0) {
      // tags1.push(triangleStrip2[j].id) //标记三角形的id
      overlap_Tris1.push(triangleStrip1[i])
    }
  }
  return [
    Tris_to_XYarr(overlap_Tris1),
    Tris_to_XYarr(overlap_Tris2),
    tags1,
    tags2,
  ]
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

//同时绘制河网结构
//绘制原始剖分线、debug三角网、重叠三角形
function draw_bridge(gl, obj) {
  let centralLine = obj.centralLine
  let originStrip = obj.originStrip
  let overlapTris = obj.overlapTris
  // let debugTriNet = obj.debugTriNet

  // var gl = getContextgl5()
  // gl.clearColor(0.95, 0.95, 0.95, 1)
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  var program = createProgram(gl, v_Shader, f_Shader)
  gl.useProgram(program.program)
  //设置缩放参数
  gl.uniform1f(program.u_Scale, 1.0)

  //绘制原始剖分三角形
  gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1])
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
    // gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制中心线
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
  /*
                                                                                                      // //绘制三角网
                                                                                                      gl.uniform4fv(program.u_color, [0.8, 0.0, 0.0, 0.8])
                                                                                                      for (let i = 0; i < debugTriNet.length; i++) {
                                                                                                          var riverBuffer = createBuffer(gl, new Float32Array(debugTriNet[i]))
                                                                                                          bindAttribute(gl, riverBuffer, program.a_Position, 2)
                                                                                                          gl.drawArrays(gl.LINE_LOOP, 0, 3) //绘制DEBUG三角网
                                                                                                      }
                                                                                                      */
}

/*
 *间断绘制发生重叠的路面和等高线
 *
 *
 *
 *
 */
/*
//para:(x,y)array
function dealData(road1, road2, width, bound) {
  // boundary = bound //给全局变量boundary赋初值
  // console.log(boundary)
      //坐标转换(x,y)->Point,同时添加id
  // 坐标转换至（-1,1）
  var roadVecs1 = transform2(road1, bound) //坐标值在(-1,1)之间
  var roadVecs2 = transform2(road2, bound) //坐标值在(-1,1)之间
  let centralLine1 = toXYArray(roadVecs1)
  let centralLine2 = toXYArray(roadVecs2)//单线状
  let centralLine = [centralLine1, centralLine2]//单线状

  //原始剖分三角形
  let pos1 = insertPts(road1, width)
  var originStrip1 = convertCor2(
      toXYArray(ptsToTriangles(pos1.pts1, pos1.pts2)),
      bound
  )
  let pos2 = insertPts(road2, width)
  var originStrip2 = convertCor2(
      toXYArray(ptsToTriangles(pos2.pts1, pos2.pts2)),
      bound
  )
  let originStrip = [originStrip1, originStrip2]

  // 0曲线插值，顶点->三角形条带
  var roadStrip1 = get_Tris(pos1.pts1, pos1.pts2)
  var roadStrip2 = get_Tris(pos2.pts1, pos2.pts2)

  // 1计算相邻两条等高线之间是否有叠置
  var overlapTris = overLapTriInDifferentline(roadStrip1, roadStrip2)
  overlapTris[0] = convertCor(overlapTris[0],bound);
  overlapTris[1] = convertCor(overlapTris[1],bound);
  console.log(overlapTris)

  return { centralLine, originStrip, overlapTris }
}
*/
