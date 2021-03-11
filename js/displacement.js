//空间叠置的冲突移位
//找到数组中需处理的首尾点(是否有多个需要处理的区间,假设只有一个)
//para:[{data:Point,tag:true/false/start/end},……]
function getStartEnd(seg) {
    var pts = []
    for (var i = 0; i < seg.length; i++) {
        if (seg[i].tag == true) {
            pts.push(seg[i])
        } else {
            break
        }
    }
    pts[0].tag = 'start'
    pts[pts.length - 1].tag = 'end'
    return pts
}

// //计算两点确定的直线参数
// function getLinePara(pt1, pt2) {
//   let A = (pt1.y - pt2.y) / (pt2.x - pt1.x)
//   let B = 1
//   let C = -pt2.y - (pt2.x * (pt1.y - pt2.y)) / (pt2.x - pt1.x)
//   return { A, B, C }
// }

//计算点到直线的垂线和垂足,p3到p1p2直线的垂足坐标
function getFootPoint(p1, p2, p3) {
    let foot = new Point()
    let dx = p1.x - p2.x
    let dy = p1.y - p2.y

    let u = (p3.x - p1.x) * dx + (p3.y - p1.y) * dy //三点共线
    u = u / (dx * dx + dy * dy)

    foot.x = p1.x + u * dx
    foot.y = p1.y + u * dy

    return foot
}

//根据percent计算中间点的坐标
//pt1为原始点,pt2为垂足点
function getCenter(pt1, pt2, percent) {
    let center = new Point() //中间点的坐标

    let dx = pt2.x - pt1.x
    let dy = pt2.y - pt1.y

    let dist = Math.sqrt(dx * dx + dy * dy) //原始点和垂足之间的距离

    center.x = (percent * dist * dx) / dist + pt1.x
    center.y = (percent * dist * dy) / dist + pt1.y
    center.id = pt1.id

    return center
}

//传入折线段，移位百分比,得到新的折线段,
function getNewLine(arr, percent) {
    //1获取移位折线段
    // let arr = getStartEnd(array)
    //2 计算新的坐标点
    let pt1 = arr[0] //起点
    let pt2 = arr[arr.length - 1] //终点

    let newArr = []
    newArr.push(pt1)
    if (arr.length > 2) {
        for (var i = 1; i < arr.length - 1; i++) {
            let foot = getFootPoint(pt1, pt2, arr[i])
            let center = getCenter(arr[i], foot, percent)
                // newArr.push(foot)
            newArr.push(center)
        }
    }
    newArr.push(pt2)

    // console.log(newArr)
    return newArr
}

//生成一条曲线y = x*x
function init_Line() {
    let points = []
    let temp = Math.PI
    for (var i = -temp / 6; i < temp / 6; i = i + 0.05) {
        let y = Math.sin(3 * i)
        let point = new Point(i, y)
        points.push(point)
    }
    return points
}

//绘制
function drawDisplacement(array1, array2) {
    let gl = getGL(window, { preserveDrawingBuffer: false, fixretina: false })
    let program = createProgram(gl, v_Shader, f_Shader)
    gl.useProgram(program.program)

    //设置缩放参数
    gl.uniform1f(program.u_Scale, 1.0)

    //array1：原始坐标
    gl.uniform4fv(program.u_color, [0, 0, 1, 1])
    var riverBuffer = createBuffer(gl, new Float32Array(array1))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    var n = array1.length / 2
    gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制多个三角形

    //array2：移位后坐标
    gl.uniform4fv(program.u_color, [1, 0, 0, 1])
    var riverBuffer = createBuffer(gl, new Float32Array(array2))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    var n = array2.length / 2
    gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制线条
}

function test() {
    let initPts = init_Line()
        // let points = init_Line().points
    let newPts = getNewLine(initPts, 0.5)
    initPts = toXYArray(initPts)
    newPts = toXYArray(newPts)
    console.log(initPts)
    console.log(newPts)

    // 绘制原始线和新的线
    drawDisplacement(initPts, newPts)
}

// detect_displacement_draw(0.5, 0.0015)
// test()

//采用移位的方式去处理冲突
//检测+移位
function detect_displacement_draw(gl, points, percent, width) {
    //1 获取折线点的坐标points
    //2 检测并标记冲突位置+移位

    //3 对冲突进行移位，得到新的折现坐标串
    let obj = sign_Overlap_Tris(points, percent, width)
    let overlapTris = Tris_to_XYarr(obj.overlap_Tris)
    let newPts = obj.newPts
        //4 生成原来的+新的坐标串
    let centralLine = toXYArray(transform1(points)) //坐标转换
    let originStrip = draw_line_Tris(points, width) //原始剖分三角形坐标

    let newCentralLine = toXYArray(transform1(newPts)) //已经删除处理后的坐标

    let debugTriNet = draw_debug_Trinet(points, width) //debug三角网坐标

    let newTriStrip = draw_line_Tris(newPts, width) //删除重叠部分三角形的坐标条带

    //4 绘制新的坐标
    draw_three_objs(
            gl,
            centralLine,
            originStrip,
            overlapTris,
            newCentralLine,
            debugTriNet,
            newTriStrip
        )
        // clearBoundary()
}

// 在一条三角形条带中，遍历每个三角形，比较并标记
// para:   triangles={{p1,p2,p3}，{}，{}，……},为Triangle对象数组
function sign_Overlap_Tris(points, percent, width) {
    console.log(points)
    let pos = insertPts(points, width)
    let triangles = get_Tris(pos.pts1, pos.pts2) //得到所有三角形串坐标

    // let newPts = points //浅拷贝，不改变原数组

    let newPts = points.slice(0), //深拷贝，不改变原数组
        overlap_Tris = []
    let len = triangles.length
        // 保存找到的有位置重叠的三角形
    var flag = false
    for (var i = 0; i < len; i++) {
        //triangles[j]不与前面的三角形发生重叠
        for (var j = i + 4; j < len && !triangles[j].tag; j++) {
            // 判断两个三角形的位置关系
            flag = Trianglesoverlap(triangles[i], triangles[j])
                // flag=true,有位置重叠
            if (flag) {
                console.log('有冲突')
                triangles[i].tag = true
                triangles[j].tag = true
                    // 保存两个重叠的三角形
                overlap_Tris.push(triangles[i])
                overlap_Tris.push(triangles[j])
                    //一边计算，一边替换
                    //找到冲突位置,对于每一个冲突位置应该有两部分需移位片段
                newPts = replacePts(percent, newPts, triangles[i].id, triangles[j].id) //从更新后的数组进行替代
            }
        }
    }
    if (overlap_Tris.length < 1) {
        console.log('折线没有重叠部分')
        overlap_Tris.length = 0 //清空数组
    }
    return { overlap_Tris, newPts }
}

//计算截取的折线段，获取新的替代片段
function replacePts(percent, points, start, end) {
    let old = points.slice(0) //深拷贝
    let gap = Math.floor((end - start) / 5)

    let seg = old.slice(start, end + gap + 1)
    let arr = direction(seg) //id

    let lastPts = [],
        nextPts = []

    lastPts = old.slice(start, arr[0]) //截取需要进行移位的部分

    let temp = arr[arr.length - 1] - gap + 1

    nextPts = old.slice(temp, end + gap + 1) //截取需要进行移位的部分

    let newPts = getNewLine(lastPts, percent)

    for (var i = 0; i < lastPts.length; i++) {
        old[start + i] = newPts[i]
    }

    newPts = getNewLine(nextPts, percent)

    for (var i = 0; i < nextPts.length; i++) {
        old[temp + i] = newPts[i]
    }
    console.log(old)
    return old //替代后的坐标串
}

//向量叉乘 顺时针：负值，逆时针：正值
function cro(v1, v2) {
    let x = v1.x * v2.y - v1.y * v2.x
    return x
}

//判断折线的折叠方向
function direction(points) {
    let arr = []
    let idArr = []
    let flag = 0
    for (var i = 1; i < points.length - 1; i++) {
        let vec1 = new Point(
            points[i].x - points[i - 1].x,
            points[i].y - points[i - 1].y
        )
        let vec2 = new Point(
            points[i + 1].x - points[i].x,
            points[i + 1].y - points[i].y
        )
        let sign = cro(vec1, vec2)
            //顺时针
        if (sign < 0) {
            flag = -1
            arr.push(flag)
        } else {
            //逆时针
            flag = 1
            arr.push(flag)
        }
        idArr.push(points[i].id) //记录id
    }

    let temp = []
    for (i = 0; i < arr.length - 1; i++) {
        if (arr[i] !== arr[i + 1]) {
            temp.push(idArr[i + 1]) //保存折叠方向开始改变的id
        }
    }
    return temp
}