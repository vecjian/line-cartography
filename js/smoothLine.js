/*

make a animation of smooth line 

*/

//平滑折线段
function addPoints(vectors) {
  let outputArr = [];
  outputArr.push(vectors[0]);
  for (var i = 0; i < vectors.length - 1; i++) {
    x1 = vectors[i].x;
    y1 = vectors[i].y;
    x2 = vectors[i + 1].x;
    y2 = vectors[i + 1].y;

    let Q = new Point(0.75 * x1 + 0.25 * x2, 0.75 * y1 + 0.25 * y2);
    let R = new Point(0.25 * x1 + 0.75 * x2, 0.25 * y1 + 0.75 * y2);

    outputArr.push(Q);
    outputArr.push(R);
  }
  outputArr.push(vectors[i]);
  return outputArr;
}

//iterations:迭代的次数
function smoothLine(vectors, iterations) {
  let outputArr = [];
  let input = vectors.slice(0);
  let tmp = [];
  for (let i = 0; i < iterations; i++) {
    tmp = addPoints(input);
    input = tmp.slice(0);
  }
  outputArr = tmp;
  return outputArr;
}
