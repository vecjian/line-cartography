//封闭境界线的骑色带设计
//两层骑色带
function generateBorderStrip(borderPoints, width) {
  var borderStrips = {}; //两层色带
  var cors1 = insertPts(borderPoints, width, false); //较窄的插值,包括左插值pts1,右插值pts2
  var cors2 = insertPts(borderPoints, 2 * width, false); //较宽的插值,包括左插值pts1,右插值pts2

  //   计算双线的坐标串
  /*
                                      borderStrips.insideStrip = convertCor1(
                                          toXYArray(ptsToTriangles(borderPoints, cors1.pts1))
                                      );
                                      borderStrips.outsideStrip = convertCor1(
                                          toXYArray(ptsToTriangles(cors1.pts1, cors2.pts1))
                                      );*/
  borderStrips.insideStrip = convertCor1(
    toXYArray(ptsToTriangles(borderPoints, cors1.pts2))
  );
  //左方向
  borderStrips.outsideStrip = convertCor1(
    toXYArray(ptsToTriangles(cors1.pts2, cors2.pts2))
  );
  borderStrips.centralLine = convertCor1(toXYArray(borderPoints));
  return borderStrips;
}

// 获取界线
function getBorder(data) {
  let features = data.features;
  let points = [];
  var pts = features[0].geometry.coordinates;
  for (var j = 0; j < pts.length; j++) {
    var pt = new Point(pts[j][0], pts[j][1]);
    points.push(pt);
  }
  console.log(points);
  return points;
}

var rect = {
  maxX: -1e3,
  minX: 1e3,
  maxY: -1e3,
  minY: 1e3,
};
//处理数据，获取数据边框
function getArea(vectorCors) {
  for (var i = 0; i < vectorCors.length; i++) {
    getMapSize1(vectorCors[i].x, vectorCors[i].y);
  }

  function getMapSize1(x, y) {
    if (rect.maxX < x) {
      rect.maxX = x;
    }
    if (rect.minX > x) {
      rect.minX = x;
    }
    if (rect.maxY < y) {
      rect.maxY = y;
    }
    if (rect.minY > y) {
      rect.minY = y;
    }
  }

  let wid = Math.abs(rect.maxX - rect.minX); //宽
  let hei = Math.abs(rect.maxY - rect.minY); //高

  let area = { wid, hei };
  return area;
}

//坐标转换
function convertCor1(xyArr) {
  let arr = [];
  for (var i = 0; i < xyArr.length; i = i + 2) {
    let x = ((2 * (xyArr[i] - rect.minX)) / (rect.maxX - rect.minX) - 1) * 0.8;
    arr.push(x);
    // console.log(xyArr[i + 1])
    let y =
      ((2 * (xyArr[i + 1] - rect.minY)) / (rect.maxY - rect.minY) - 1) * 0.8;
    arr.push(y);
  }
  return arr;
}

//三角形三角化
function getTriangles(pts) {
  let arr = [];
  for (var i = 0; i < pts.length; i++) {
    arr.push(pts[i].x);
    arr.push(pts[i].y);
  }

  var triangles = earcut(arr);
  console.log(triangles);

  let cor = [];
  for (var j = 0; j < triangles.length; j++) {
    console.log(triangles[j]);
    cor.push(pts[triangles[j]]);
  }
  return cor;
}
