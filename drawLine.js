// 1.绘制线
// 2.绘制三角网
// 3.绘制变色后的三角形
// 4.面状的色带缓冲区

// 生成随机的线条
function initLine(Pt_num) {
    let pts_vector = [];
    for (let i = 0; i < Pt_num; i++) {
        let x = (Math.random() - 0.5) * 0.5;
        let y = (Math.random() - 0.5) * 0.5;
        let vec = new Point(x, y);
        pts_vector.push(vec);
    }
    return pts_vector;
}


// 绘制，检测，重绘
function detect(pts, width) {
    // var pts = initLine(50);
    // let width = 0.05;

    // draw_line_Tris(pts, width); //绘制线
    // draw_debug_Trinet(pts, width); //绘制debug三角网
    // draw_Triobjs(pts, width); //绘制重叠三角形
}

function draw(points, width) {
    // let pos = insertPts(points, width);
    // let array = toXYArray(ptsToTriangles(pos.pts1, pos.pts2)); //得到所有组成线段的三角形坐标

    //计算了很多遍插值

    let line = toXYArray(points);
    let array_line = draw_line_Tris(points, width); //原始剖分三角形坐标
    let array_overlaptri = draw_Triobjs(points, width); // 重叠三角形坐标
    let array_debug = draw_debug_Trinet(points, width); //debug三角网坐标

    // 绘制
    draw_three_objs(line, array_line, array_overlaptri, array_debug);
}

//绘制三角形串表示的线
function draw_line_Tris(points, width) {
    let pos = insertPts(points, width);
    let array = toXYArray(ptsToTriangles(pos.pts1, pos.pts2)); //得到所有组成线段的三角形坐标

    let arr = [];
    arr.push(array);

    return arr;
    // 绘制三角形
    // drawRiver(arr, [0.0, 0.0, 1.0, 1.0]);
}

//  绘制debug三角网
function draw_debug_Trinet(points, width) {
    let pos = insertPts(points, width);
    let array = ptsToTriangles(pos.pts1, pos.pts2); //得到所有组成线段的三角形坐标
    let arr = [];
    for (var i = 0; i < array.length; i = i + 3) {
        let tri = [array[i], array[i + 1], array[i + 2]];
        arr.push(tri);
    }
    let tri_xy = [];
    for (var j = 0; j < arr.length; j++) {
        tri_xy.push(toXYArray(arr[j])); //将三角形坐标转换成xy,数组
    }

    return tri_xy;
    // 绘制三角网
    // drawTriNet(tri_xy); //黑色边框
}

// 绘制重叠三角形
function draw_Triobjs(points, width) {
    let pos = insertPts(points, width);
    let array = get_Tris(pos.pts1, pos.pts2); //得到所有组成线段的三角形坐标
    let overlapTris = get_Overlap_Tris(array); //找出所有产生重叠的三角形
    array = Tris_to_XYarr(overlapTris); //将三角形坐标转换成xy数组

    // 绘制变颜色的重叠三角形
    // let color = [1.0, 0.0, 0.0, 1.0]; //重叠三角形变成红色
    let arr = [];
    arr.push(array);

    return arr;
    // drawRiver(arr, color);
}

// 遍历每个三角形，比较得到重叠的三角形
// para:   triangles={{p1,p2,p3}，{}，{}，……},为Triangle对象数组
function get_Overlap_Tris(triangles) {
    let len = triangles.length;

    // 保存找到的有位置重叠的三角形
    let overlap_Tris = [];
    var flag = false;

    // let arr = triangles; //将数组赋值给另外一个数组，可能会改变数组的值

    for (var i = 0; i < len; i++) {
        //triangles[j]不与前面的三角形发生重叠
        for (var j = i + 1; j < len && !triangles[j].tag; j++) {

            // 判断两个三角形的位置关系
            flag = Trianglesoverlap(triangles[i], triangles[j]);

            // flag=true,有位置重叠
            if (flag) {
                triangles[i].tag = true;
                triangles[j].tag = true;
                // 保存两个重叠的三角形
                overlap_Tris.push(triangles[i]);
                overlap_Tris.push(triangles[j]);
            }
        }
    }
    if (overlap_Tris.length < 1) {
        console.log("折线没有重叠部分");
        overlap_Tris.length = 0; //清空数组
    }
    return overlap_Tris;
}

//三角形对象数组转换为xy坐标，方便绘制
function Tris_to_XYarr(triangles) {
    let len = triangles.length;
    if (triangles.length < 1) {
        console.log("没有重叠三角形");
        triangles.length = 0; //清空数组
        return triangles;
    }
    let xyArr = [];

    for (var i = 0; i < len; i++) {
        let ABC = [];
        ABC = Triangle.get_Tris_XYarr(triangles[i]);
        xyArr = xyArr.concat(toXYArray(ABC)); //数组拼接
    }
    return xyArr;
}