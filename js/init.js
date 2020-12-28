//初始化封闭线段,境界线必须要是封闭的吗？
function initclosedLine() {
  var vectors = [];
  var point = new Point(-0.7, 0, 0);
  var point1 = new Point(-0.5, -0.6);
  var point2 = new Point(0.0, 0.0);
  var point3 = new Point(0.5, 0.4);
  var point4 = new Point(0.8, 0.6);
  var point5 = new Point(0.6, 0.9);
  var point6 = new Point(0.0, 0.95);
  var point7 = new Point(-0.6, 0.5);
  var point8 = new Point(-0.8, 0.4);
  vectors.push(point);
  vectors.push(point1);
  vectors.push(point2);
  vectors.push(point3);
  vectors.push(point4);
  vectors.push(point5);
  vectors.push(point6);
  vectors.push(point7);
  vectors.push(point8);
  vectors.push(point);

  let pts = smoothLine(vectors, 1);
  return pts;
}
