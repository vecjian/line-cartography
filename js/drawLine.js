// test:解决线冲突
// 1.绘制线
// 2.绘制三角网
// 3.绘制变色后的三角形
// 4.面状的色带缓冲区

// 绘制，检测，重绘,para:points:Point类
function draw_detect(gl, points, width) {
  //计算了很多遍插值
  let centralLine = toXYArray(transform1(points, boundary)) //坐标转换

  let originStrip = draw_line_Tris(points, width) //原始剖分三角形坐标

  let obj = draw_Triobjs(points, width) // 重叠三角形坐标
  let overlapTris = obj.array

  let newCentralLine = toXYArray(transform1(obj.newPts, boundary)) //已经删除处理后的坐标

  let debugTriNet = draw_debug_Trinet(points, width) //debug三角网坐标

  let newTriStrip = draw_line_Tris(obj.newPts, width) //删除重叠部分三角形的坐标条带

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

//绘制三角形串表示的线
function draw_line_Tris(points, width, isConverted) {
  let pos = insertPts(points, width, true)
  var array = convertCor(
    toXYArray(ptsToTriangles(pos.pts1, pos.pts2)),
    boundary
  ) //得到所有组成线段的三角形坐标
  return array
}

//  绘制debug三角网
function draw_debug_Trinet(points, width) {
  let pos = insertPts(points, width)
  let array = ptsToTriangles(pos.pts1, pos.pts2) //得到所有组成线段的三角形坐标
  let arr = []
  for (var i = 0; i < array.length; i = i + 3) {
    let tri = [array[i], array[i + 1], array[i + 2]]
    arr.push(tri)
  }
  let tri_xy = []
  for (var j = 0; j < arr.length; j++) {
    tri_xy.push(toXYArray(arr[j])) //将三角形坐标转换成xy,数组
  }

  for (var i = 0; i < tri_xy.length; i++) {
    tri_xy[i] = convertCor(tri_xy[i], boundary)
  }
  // tri_xy = convertCor(tri_xy);
  return tri_xy
  // 绘制三角网
  // drawTriNet(tri_xy); //黑色边框
}

// 绘制重叠三角形
function draw_Triobjs(points, width) {
  let pos = insertPts(points, width)
  let array = get_Tris(pos.pts1, pos.pts2) //得到所有组成线段的三角形坐标
  let overlapTris = get_Overlap_Tris(array, points) //找出所有产生重叠的三角形
  let newPts = overlapTris.newPts
  array = convertCor(Tris_to_XYarr(overlapTris.overlap_Tris), boundary) //将三角形坐标转换成xy数组

  return { array, newPts }
}

// 在一条三角形条带中，遍历每个三角形，比较得到重叠的三角形
// para:   triangles={{p1,p2,p3}，{}，{}，……},为Triangle对象数组
function get_Overlap_Tris(triangles, points) {
  let len = triangles.length
  // 保存找到的有位置重叠的三角形
  let overlap_Tris = []
  var flag = false
  // var newPts = addID(points); //添加id
  var newPts = points.slice(0) //添加id
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
        newPts = deletePts(newPts, triangles[i].id, triangles[j].id) //每次都从原数组进行删除，不对……
      }
    }
  }
  if (overlap_Tris.length < 1) {
    console.log('折线没有重叠部分')
    overlap_Tris.length = 0 //清空数组
  }
  return { overlap_Tris, newPts }
}

function getID(m) {
  if (m % 2 == 0) {
    return Math.floor((m - 1) / 2)
  } else {
    return Math.floor(m / 2)
  }
}

//points数组删除指定索引范围的坐标，获取新的线坐标
function deletePts(points, start, end) {
  // console.log(start, end)
  start = getID(start)
  end = getID(end)
  // console.log(start, end)
  let pts = []
  let gap = end - start
  for (var i = 0; i < points.length; i++) {
    if (points[i].id == start) {
      pts.push(points[i])
      //确保删除的线段之间没有被删除过，如果points中id不连续时，会截断后面所有的顶点
      if (points[i + 1].id == start + 1) {
        i = i + gap
      }
    } else {
      pts.push(points[i])
    }
  }
  return pts
}

// //删除一系列顶点，重新计算删除部分的三角形图元
// function get_repalceTris(points, start, end) {
//   let arr = [points[i], points[j]]
//   let pos = insertPts(arr)
//   let triangles = get_Tris(pos.pts1, pos.pts2) //用于替代原来中间的几个三角形图元
// }

//三角形对象数组转换为xy坐标，方便绘制
function Tris_to_XYarr(triangles) {
  let len = triangles.length
  if (triangles.length < 1) {
    console.log('没有重叠三角形')
    triangles.length = 0 //清空数组
    return triangles
  }
  let xyArr = []

  for (var i = 0; i < len; i++) {
    if (triangles[i] != -1) {
      let ABC = []
      ABC = Triangle.get_Tris_XYarr(triangles[i])
      xyArr = xyArr.concat(toXYArray(ABC)) //数组拼接
    }
  }

  //转换坐标
  // xyArr = convertCor(xyArr)？？？？？？？？？？？？
  return xyArr
}

function convertCor(xyArr, bound) {
  let arr = []
  let scale = Math.max(bound.maxX - bound.minX, bound.maxY - bound.minY)

  for (var i = 0; i < xyArr.length; i = i + 2) {
    let x = ((2 * (xyArr[i] - bound.minX)) / scale - 1) * 0.95
    let y = ((2 * (xyArr[i + 1] - bound.minY)) / scale - 1) * 0.95
    arr.push(x, y)
  }
  return arr
}
