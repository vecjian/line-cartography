/*********************************************************************************** */
//实现道格拉斯普克算法抽稀节点
//调用道格拉斯算法简化线节点
function simplify(points) {
    // var len = points.length;
    // var pointsXY = [];

    // var res = getCoorVector2(line);
    // var d = calculateDis(points[0], points[len - 1]);
    // console.log(d);
    var result = douglasPeucker(points, 0.0006);
    // console.log(pointsXY);
    return result;
}

//1计算两个点之间的距离
function calculateDis(point1, point2) {
    let dis = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    return dis;
}

//2计算中间点到ab起止直线段的垂直距离
//利用海伦公式
function distToSegment(start, end, center) {
    let a = calculateDis(start, end);
    let b = calculateDis(center, end);
    let c = calculateDis(start, center);
    let p = (a + b + c) / 2;
    let S = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
    return S * 2.0 / a;
}

//递归实现
function compressLine(coordinates, result, start, end, dMax) {
    if (start < end) {
        let maxDist = 0;
        let currrentIndex = 0;
        let startPoint = coordinates[start];
        let endPoint = coordinates[end];
        //找到线段的最远点
        for (let i = start + 1; i < end; i++) {
            let currentDist = distToSegment(startPoint, endPoint, coordinates[i]);
            if (currentDist > maxDist) {
                maxDist = currentDist;
                currrentIndex = i;
            }
        }
        if (maxDist >= dMax) {
            //将最远点加入筛选后的数组
            result.push(coordinates[currrentIndex]);
            //以超过阈值的点为中心，将线段拆分成两段，分别对两段进行递归处理
            compressLine(coordinates, result, start, currrentIndex, dMax);
            compressLine(coordinates, result, currrentIndex, end, dMax);
        }
    }
    return result;
}

//daogelas算法
function douglasPeucker(coordinates, dMax) {
    if (!coordinates || !(coordinates.length > 2)) {
        return null;
    }
    coordinates.forEach((item, index) => {
        item.id = index;
    });
    let len = coordinates.length;
    let result = compressLine(coordinates, [], 0, len - 1, dMax);
    //将起止点加入到简化数组中
    result.push(coordinates[0]);
    result.push(coordinates[len - 1]);

    //对保留下来的点按照索引值进行排序，确保点的顺序是按照原始数组排列
    let resCoor = result.sort((a, b) => {
        if (a.id < b.id) {
            return -1;
        } else if (a.id > b.id) {
            return 1;
        }
        return 0;
    });

    resCoor.forEach((item) => {
            item.id = undefined;
        })
        // console.log(resCoor);
    return resCoor;
}