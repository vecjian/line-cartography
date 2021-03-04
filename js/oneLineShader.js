//单线的色带设计
//获取数据
function getData(data) {
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
  //2 获取边界
  getArea(points)
  //3 转换数据
  let bounds = getMultiBounds(points, 0.001)
  //4 将特定结构的数据传入着色器绘制
  multiLine(bounds)
}
// drawLineWithShader(generalizationLine)
