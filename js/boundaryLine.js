//封闭境界线的骑色带设计
//两层骑色带
function generateBorderStrip(borderPoints, width) {
  var borderStrips = {} //两层色带
  var cors1 = insertPts(borderPoints, width, false) //较窄的插值,包括左插值pts1,右插值pts2
  var cors2 = insertPts(borderPoints, 2 * width, false) //较宽的插值,包括左插值pts1,右插值pts2

  borderStrips.insideStrip = convertCor1(
    toXYArray(ptsToTriangles(borderPoints, cors1.pts2))
  )
  //左方向
  borderStrips.outsideStrip = convertCor1(
    toXYArray(ptsToTriangles(cors1.pts2, cors2.pts2))
  )
  borderStrips.centralLine = convertCor1(toXYArray(borderPoints))
  // 索引值
  borderStrips.indexArr = getTriangles(borderPoints)
  return borderStrips
}

// 获取界线
function getBorder(data) {
  let features = data.features
  let points = []
  var pts = features[0].geometry.coordinates
  for (var j = 0; j < pts.length; j++) {
    var pt = new Point(pts[j][0], pts[j][1])
    points.push(pt)
  }
  // pt = new Point(pts[0][0], pts[0][1])
  // points.push(pt)
  console.log(j)
  return points
}

var rect = {
  maxX: -1e3,
  minX: 1e3,
  maxY: -1e3,
  minY: 1e3,
}

//处理数据，获取数据边框
function getArea(vectorCors) {
  for (var i = 0; i < vectorCors.length; i++) {
    getMapSize1(vectorCors[i].x, vectorCors[i].y)
  }

  function getMapSize1(x, y) {
    if (rect.maxX < x) {
      rect.maxX = x
    }
    if (rect.minX > x) {
      rect.minX = x
    }
    if (rect.maxY < y) {
      rect.maxY = y
    }
    if (rect.minY > y) {
      rect.minY = y
    }
  }

  let wid = Math.abs(rect.maxX - rect.minX) //宽
  let hei = Math.abs(rect.maxY - rect.minY) //高

  let area = { wid, hei }
  return area
}

//坐标转换
function convertCor1(xyArr) {
  let arr = []
  for (var i = 0; i < xyArr.length; i = i + 2) {
    let x = ((2 * (xyArr[i] - rect.minX)) / (rect.maxX - rect.minX) - 1) * 0.8
    arr.push(x)
    // console.log(xyArr[i + 1])
    let y =
      ((2 * (xyArr[i + 1] - rect.minY)) / (rect.maxY - rect.minY) - 1) * 0.8
    arr.push(y)
  }
  return arr
}

//三角形三角化
function getTriangles(pts) {
  let arr = []
  for (var i = 0; i < pts.length; i++) {
    arr.push(pts[i].x)
    arr.push(pts[i].y)
  }

  var triangles = earcut(arr)
  // console.log(triangles);
  return triangles
}

//创建索引buffer
function createIndexBuffer(gl, indices) {
  var indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  )
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  return indexBuffer
}

function drawBorderArea(trianglestrip, debug, central) {
  let gl = getContextgl3()
  gl.clearColor(0.95, 0.95, 0.95, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  var program = createProgram(gl, v_Shader, f_Shader)
  gl.useProgram(program.program)

  //绘制双线
  let insideStrip = trianglestrip.insideStrip
  let outsideStrip = trianglestrip.outsideStrip

  gl.uniform4fv(program.u_color, [0.7, 0.7, 0.7, 1.0])
  riverBuffer = createBuffer(gl, new Float32Array(outsideStrip))
  bindAttribute(gl, riverBuffer, program.a_Position, 2)
  var n = outsideStrip.length / 2
  gl.drawArrays(gl.TRIANGLES, 0, n)
  if (debug) {
    gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
    gl.drawArrays(gl.LINE_STRIP, 0, n)
  }

  gl.uniform4fv(program.u_color, [0.5, 0.5, 0.5, 1.0])
  var riverBuffer = createBuffer(gl, new Float32Array(insideStrip))
  bindAttribute(gl, riverBuffer, program.a_Position, 2)
  n = insideStrip.length / 2
  gl.drawArrays(gl.TRIANGLES, 0, n)
  if (debug) {
    gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
    gl.drawArrays(gl.LINE_STRIP, 0, n)
  }

  if (central) {
    // 绘制中心线
    gl.uniform4fv(program.u_color, [1.0, 1.0, 1.0, 1.0])
    //绑定坐标
    riverBuffer = createBuffer(gl, new Float32Array(trianglestrip.centralLine))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    //绑定索引值
    var indexBuffer = createIndexBuffer(gl, trianglestrip.indexArr)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    n = trianglestrip.indexArr.length
    // gl.drawElements(gl.LINES, n, gl.UNSIGNED_SHORT, 0);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0)
  }
}

// 境界线
function drawBorder(trianglestrip, debug, central) {
  let gl = getContextgl3()
  gl.clearColor(0.95, 0.95, 0.95, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  var program = createProgram(gl, v_Shader, f_Shader)
  gl.useProgram(program.program)

  //绘制双线
  let insideStrip = trianglestrip.insideStrip
  let outsideStrip = trianglestrip.outsideStrip

  gl.uniform4fv(program.u_color, [0.7, 0.7, 0.7, 1.0])
  riverBuffer = createBuffer(gl, new Float32Array(outsideStrip))
  bindAttribute(gl, riverBuffer, program.a_Position, 2)
  n = outsideStrip.length / 2
  gl.drawArrays(gl.TRIANGLES, 0, n)
  if (debug) {
    gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
    gl.drawArrays(gl.LINE_STRIP, 0, n)
  }

  gl.uniform4fv(program.u_color, [0.5, 0.5, 0.5, 1.0])
  var riverBuffer = createBuffer(gl, new Float32Array(insideStrip))
  bindAttribute(gl, riverBuffer, program.a_Position, 2)
  n = insideStrip.length / 2
  gl.drawArrays(gl.TRIANGLES, 0, n)
  if (debug) {
    gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
    gl.drawArrays(gl.LINE_STRIP, 0, n)
  }

  if (central) {
    // 绘制中心线
    gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
    riverBuffer = createBuffer(gl, new Float32Array(trianglestrip.centralLine))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = trianglestrip.centralLine.length / 2
    gl.drawArrays(gl.LINE_STRIP, 0, n)
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  }
}

/**********************************************************
 *********************************************************** */
//采用着色器方法绘制界线
function drawWithShader(border) {
  //1 获取数据
  //初始化界线
  var points = getBorder(border)
  //获取数据边框
  getArea(points) //注意react的值

  //2 计算，转换数据
  let bounds = getMultiBounds(points, 0.15)
  //3 传递数据到着色器绘制
  multiLine(bounds)
}

//多个四边形
function getMultiBounds(borderPoints, width) {
  var borderStrips = {} //两层色带
  var cors1 = insertPts(borderPoints, width * 2, false) //较窄的插值,包括左插值pts1,右插值pts2
  // var cors2 = insertPts(borderPoints, 2 * width, false) //较宽的插值,包括左插值pts1,右插值pts2

  var arr1 = cors1.pts2 //左插值
  var arr2 = borderPoints //原始折线

  var arr = []
  for (var i = 0; i < arr2.length; i++) {
    arr.push(arr2[i])
    arr.push(arr1[i])
  }
  let bounds = convertCor1(toXYArray(arr))
  return bounds

  // borderStrips.insideStrip = convertCor1(
  // toXYArray(ptsToTriangles(borderPoints, cors1.pts2))
  // )
  // //左方向
  // borderStrips.outsideStrip = convertCor1(
  //   toXYArray(ptsToTriangles(cors1.pts2, cors2.pts2))
  // )
  // borderStrips.centralLine = convertCor1(toXYArray(borderPoints))
  // // 索引值
  // borderStrips.indexArr = getTriangles(borderPoints)
  // return borderStrips
}

drawWithShader(border)
