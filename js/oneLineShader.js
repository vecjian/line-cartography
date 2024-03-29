//单线的色带设计
//获取数据
function getData(data) {
  // let pts = data.geometries[0].coordinates
  let pts = data.features[0].geometry.coordinates
  console.log(pts)
  var points = []
  for (var j = 0; j < pts.length; j++) {
    var pt = new Point(pts[j][0], pts[j][1])
    points.push(pt)
  }
  return points
}

function drawLineWithShader(data) {
  //清空外接矩形
  clearRect()
  //1 获取原始数据
  let points = getData(data)
  //2 获取境界线边界
  getArea(points)
  //3 转换数据
  let bounds = getMultiBounds(points, 0.2)
  // let bounds = getMultiBounds(points, 0.1)
  // let bounds = getMultiBounds(points, 0.008)
  //4 将特定结构的数据传入着色器绘制
  multiLine(bounds)
}
drawLineWithShader(boundary4)
// drawLineWithShader(generalizationLine)
// drawLineWithShader(oneRoad)
// drawLineWithShader(border)
