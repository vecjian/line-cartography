//等高线的并绘

function getContourArea(vectorCors, rectangle) {
  function getMapSize1(x, y) {
    if (rectangle.maxX < x) {
      rectangle.maxX = x
    }
    if (rectangle.minX > x) {
      rectangle.minX = x
    }
    if (rectangle.maxY < y) {
      rectangle.maxY = y
    }
    if (rectangle.minY > y) {
      rectangle.minY = y
    }
  }
  for (var i = 0; i < vectorCors.length; i++) {
    getMapSize1(vectorCors[i].x, vectorCors[i].y)
  }

  // let wid = Math.abs(rect.maxX - rect.minX) //宽
  // let hei = Math.abs(rect.maxY - rect.minY) //高
}

//计算图幅最大外接矩形
function getMinArea(contours) {
  //   var len = contours.length
  //   for (var i = 0; i < len; i++) {
  //     //初始化外接矩形
  //     var area = {
  //       maxX: -1e3,
  //       minX: 1e3,
  //       maxY: -1e3,
  //       minY: 1e3,
  //     }
  //     getContourArea(contours[i],area)
  //     if () {
  //       area.wid = temp.wid
  //     }
  //   }
  var area = {
    maxX: -1e3,
    minX: 1e3,
    maxY: -1e3,
    minY: 1e3,
  }
  return area
}

//points是Point类数组
function transform2(points, bound) {
  let vecs = []
  for (let i = 0; i < points.length; i++) {
    let x = points[i].x
    let y = points[i].y
    //转换到（-1,1）之间
    x = ((2 * (x - bound.minX)) / (bound.maxX - bound.minX) - 1) * 0.95
    y = ((2 * (y - bound.minY)) / (bound.maxY - bound.minY) - 1) * 0.95
    let vec = new Point(x, y, i)
    vecs.push(vec)
  }
  return vecs
}

//三条及以上的等高线并绘
//contours:矢量顶点坐标数组，代表多条等高线
//不同两条等高线的叠置判断
function selectContour(contours, width) {
  var len = contours.length
  var contourVecs = []
  var contourStrip = []

  // 获取外接矩形
  var bound = getMinArea(contours)

  //坐标转换(x,y)->Point
  for (var m = 0; m < len; m++) {
    contourVecs.push(transform2(contours[m], bound))
  }

  //0曲线插值，顶点->三角形条带
  var trianglesArr = [] //多条三角形条带
  for (m = 0; m < len; m++) {
    var position = contourStrip.push(insertPts(contourVecs[m], width, false)) //不渐变宽度
    var triangles = get_Tris(position.pts1, position.pts2)
    trianglesArr.push(triangles)
  }

  //1计算相邻两条等高线之间是否有叠置
  var objArr = []
  for (var i = 0; i < trianglesArr.length - 1; i++) {
    var obj = overLapTriInDifferentline(triangleStrip1, triangleStrip2)
  }
  //2判断叠置的位置是否相近

  //3制定一定的原则，选择可表示的等高线（间隔一条选一条）
}

//计算两条曲线中存在的重叠三角形
function overLapTriInDifferentline(triangleStrip1, triangleStrip2) {
  var flag = false
  var overlap_Tris1 = [],
    overlap_Tris2 = []
  for (var i = 0; i < triangleStrip1.length; i++) {
    var m = 0
    for (var j = 0; j < triangleStrip2.lemgth; j++) {
      flag = Trianglesoverlap(triangleStrip1[i], triangleStrip2[j])
      if (flag) {
        console.log('俩曲线有冲突')
        m++
      }
      overlap_Tris2.push(triangleStrip2[j])
    }
    //重复的三角形只存一次
    if (m > 0) {
      overlap_Tris1.push(triangleStrip1[i])
    }
  }
  return { triangleStrip1, triangleStrip2 }
}
