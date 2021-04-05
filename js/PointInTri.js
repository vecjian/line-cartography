// Point 类
class Point {
  constructor(x, y, id) {
    this.x = x || 0
    this.y = y || 0
    this.id = id
  }

  static normalize(m) {
    let len = Math.sqrt(m.x * m.x + m.y * m.y)
    let x = m.x / len
    let y = m.y / len
    let vec = new Point(x, y)
    return vec
  }

  static addVector(m, n) {
    let x = m.x + n.x
    let y = m.y + n.y
    let v = new Point(x, y)

    return v
  }

  // m：后续节点  n:前驱结点
  static subVector(m, n) {
    let x = m.x - n.x
    let y = m.y - n.y
    let v = new Point(x, y)

    return v
  }

  //叉乘方向
  static mutiply(m, n) {}

  //点乘
  static dot(m, n) {
    return m.x * n.x + m.y * n.y
  }

  setX(x) {
    this.x = x
  }

  setY(y) {
    this.y = y
  }
}

// 定义一个三角形类，实现重叠比较操作
class Triangle {
  constructor(a, b, c, id) {
    this.a = a
    this.b = b
    this.c = c
    this.id = id
    this.tag = false //用于标记三角形的颜色是否需要更改
  }

  // 将三角形的三个顶点存在一个点数组里面方便进行遍历
  setTriArr() {
    let points = []
    points.push(this.a)
    points.push(this.b)
    points.push(this.c)
    this.points = points
  }

  //将三角形的三个顶点放在一个数组里边
  static get_Tris_XYarr(Tri) {
    let points = []
    points.push(Tri.a)
    points.push(Tri.b)
    points.push(Tri.c)
    return points
  }

  // Barycentric Technique 求重心坐标系系数判断三角形相交
  // a,b,c为三角形的三个顶点坐标
  // P点的坐标用向量基底表示
  /* para:
        p:已知点Point类型
        Tri:三角形
  */
  static PointInTriangle(p, Tri) {
    let a = Tri.a
    let b = Tri.b
    let c = Tri.c

    //计算基底向量
    let v1 = new Point(b.x - a.x, b.y - a.y)
    let v0 = new Point(c.x - a.x, c.y - a.y)

    let v2 = new Point(p.x - a.x, p.y - a.y)

    // 计算向量之间的点乘
    let dot00 = Point.dot(v0, v0)
    let dot01 = Point.dot(v0, v1)
    let dot02 = Point.dot(v0, v2)
    let dot11 = Point.dot(v1, v1)
    let dot12 = Point.dot(v1, v2)

    // 计算系数u,v
    let m = 1 / (dot00 * dot11 - dot01 * dot01)
    let u = m * (dot11 * dot02 - dot01 * dot12) //系数u;
    let v = m * (dot00 * dot12 - dot01 * dot02) //系数v;

    return u > 0 && v > 0 && u + v < 1 //满足要求，则p在三角形ABC内
  }

  /*
    // 判断两个三角形互相之间的重叠关系
    // para:Tri1, Tri2两个三角形对象
    static TrianglesOverlap(Tri1, Tri2) {
        let m = this.PointInTriangle(Tri1.a, Tri2);
        let n = this.PointInTriangle(Tri1.b, Tri2);
        let p = this.PointInTriangle(Tri1.c, Tri2);

        // 只要有一个点落在另外一个三角形内，则两个三角形重叠
        if (m || n || p) {
            return true;
        } else {
            return false;
        }
    }

    //计算两个三角形之间的重叠关系
    static isOverlap(Tri1, Tri2) {
        // 判断三角形1的顶点是否在三角形2以内
        var temp = this.TrianglesOverlap(Tri1, Tri2);
        if (temp) {
            console.log("两个三角形有重叠部分");
            return true;
        } else {
            // 判断三角形2的顶点是否在三角形1以内
            temp = Triangle.TrianglesOverlap(Tri2, Tri1);
            if (temp) {
                console.log("两个三角形有重叠部分");
                return true;
            } else {
                console.log("两个三角形不重叠");
                return false;
            }
        }
    }*/

  // 判断三角形是否相互包含
  static contain(Tri1, Tri2) {
    let m = this.PointInTriangle(Tri1.a, Tri2)
    let n = this.PointInTriangle(Tri1.b, Tri2)
    let p = this.PointInTriangle(Tri1.c, Tri2)

    if (m && n && p) {
      return true
    } else {
      m = this.PointInTriangle(Tri2.a, Tri1)
      n = this.PointInTriangle(Tri2.b, Tri1)
      p = this.PointInTriangle(Tri2.c, Tri1)

      if (m && n && p) {
        return true
      } else {
        return false
      }
    }
  }

  // 更改三角形的颜色
  // a:bool类型的参数，用于判断是否需要更改颜色
  changeColor(a) {
    if (a) {
      this.tag = true
    }
  }
}

/*
var p1 = new Point(1, 0);
var p2 = new Point(2, 0);
var p3 = new Point(1.5, 2);

var p4 = new Point(0, 0);
var p5 = new Point(2, 2);
var p6 = new Point(2, -1);

var p7 = new Point(0, 0);
var p8 = new Point(-1, 0);
var p9 = new Point(2, -1);

// 定义两个三角形
var tri2 = new Triangle(p1, p2, p3);
// var tri1 = new Triangle(p4, p5, p6);
var tri3 = new Triangle(p7, p8, p9);


// Triangle.isOverlap(tri3, tri1);
Trianglesoverlap(tri3, tri2);
*/

// 判断四个点组成的两条线段MN,PQ所在直线是否相交，以及交点是否在线段上
// 未考虑三角形线段交点在线段端点处的情况，此情况下三角形有可能并不相交？？
function lineIntersection(M, N, P, Q) {
  var flag = false
  const THRESHOLD = 0.0001 //用于避免由于精度导致的计算错误

  // 线段1
  A1 = N.y - M.y
  B1 = M.x - N.x
  C1 = A1 * M.x + B1 * M.y

  // 线段2
  A2 = Q.y - P.y
  B2 = P.x - Q.x
  C2 = A2 * P.x + B2 * P.y

  var det = A1 * B2 - A2 * B1
  // 线段直线平行
  if (det == 0) {
    x = 1e8
    y = 1e8
  } else {
    x = (B2 * C1 - B1 * C2) / det
    y = (A1 * C2 - A2 * C1) / det
  }

  //判断交点是否在线段上，不包含三角形顶点
  if (
    x < Math.max(M.x, N.x) - THRESHOLD &&
    x > Math.min(M.x, N.x) + THRESHOLD &&
    y < Math.max(M.y, N.y) - THRESHOLD &&
    y > Math.min(M.y, N.y) + THRESHOLD
  ) {
    if (
      x < Math.max(P.x, Q.x) - THRESHOLD &&
      x > Math.min(P.x, Q.x) + THRESHOLD &&
      y < Math.max(P.y, Q.y) - THRESHOLD &&
      y > Math.min(P.y, Q.y) + THRESHOLD
    ) {
      // console.log("有交点且交点在线段内");
      flag = true //有交点且交点在三角形边上
    }
  } else {
    // console.log("无交点在线段内");
    // flag = false; //没有交点，或交点不在三角形边上
  }
  /*
        //判断交点是否在线段上，不包含三角形顶点
        if (
            x < Math.max(M.x, N.x) &&
            x > Math.min(M.x, N.x) &&
            y < Math.max(M.y, N.y) &&
            y > Math.min(M.y, N.y)
        ) {
            if (
                x < Math.max(P.x, Q.x) &&
                x > Math.min(P.x, Q.x) &&
                y < Math.max(P.y, Q.y) &&
                y > Math.min(P.y, Q.y)
            ) {
                console.log("有交点且交点在线段内");
                flag = true; //有交点且交点在三角形边上
            }
        } else {
            console.log("无交点在线段内");
            // flag = false; //没有交点，或交点不在三角形边上
        }*/

  return flag
}

// 判断三角形是否有重叠，先判断相交性，再判断重叠性
function Trianglesoverlap(Tri1, Tri2) {
  // 将三角形的顶点存在一个数组中,方便进行循环组合
  Tri1.setTriArr()
  Tri2.setTriArr()

  var flag1 = false //是否相交
  var flag2 = false //是否相互包含
  var flag //是否相互重叠

  //判断三角形线段是否相交
  for (var i = 1; i < 4; i++) {
    for (var j = 1; j < 4; j++) {
      flag1 = lineIntersection(
        // 取余实现三角形边之间的轮换
        Tri1.points[i % 3],
        Tri1.points[(i + 1) % 3],
        Tri2.points[j % 3],
        Tri2.points[(j + 1) % 3]
      )
      // 一旦发现相交，跳出循环
      if (flag1) {
        break
      }
    }
    if (flag1) {
      break
    }
  }

  //判断三角形是否相互包含,若相互包含，则一定相交
  flag2 = Triangle.contain(Tri1, Tri2)

  if (flag1 || flag2) {
    flag = true
  } else {
    // console.log('三角形无重叠')
    flag = false
  }
  return flag
}
