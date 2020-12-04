//封闭境界线的骑色带设计
//两层骑色带
function border(borderPoints, width) {
  var borderStrips = {}; //两层色带
  var cors1 = insertPts(borderPoints, width, false); //较窄的插值,包括左插值pts1,右插值pts2
  var cors2 = insertPts(borderPoints, 2 * width, false); //较宽的插值,包括左插值pts1,右插值pts2

  //   计算双线的坐标串
  borderStrips.insideStrip = toXYArray(
    ptsToTriangles(borderPoints, cors1.pts2)
  );
  borderStrips.outsideStrip = toXYArray(ptsToTriangles(cors1.pts2, cors2.pts2));
  borderStrips.centralLine = toXYArray(borderPoints);
  return borderStrips;
}
