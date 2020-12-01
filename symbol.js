//绘制符号
// 给定一个中心线，绘制双线高速公路
// points为POINT对象数组
function generateDoubleLine(points, width) {
  var triangleStrips = {};
  var cors1 = insertPts(points, width, false); //较窄的插值,包括左插值pts1,右插值pts2
  var cors2 = insertPts(points, 2 * width, false); //较宽的插值,包括左插值pts1,右插值pts2

  //   计算双线的坐标串

  triangleStrips.leftStrip = toXYArray(ptsToTriangles(cors2.pts1, cors1.pts1)); //左右
  triangleStrips.rightStrip = toXYArray(ptsToTriangles(cors1.pts2, cors2.pts2));
  triangleStrips.centralStrip = toXYArray(
    ptsToTriangles(cors1.pts1, cors1.pts2)
  ); //左右

  return trianglestrip;
}
