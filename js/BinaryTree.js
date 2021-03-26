//利用二叉树重建河网拓扑结构
// 二叉树的节点为每一个河段
// 河段指的是从河源到汇口之间或者汇口和汇口之间的河流段
let widLevel = {
    level1: 0.001,
    level2: 0.0016,
    level3: 0.0015,
    level4: 0.00095,
    level5: 0.00088,

    // level1: 0.002,
    // level2: 0.0018,
    // level3: 0.0016,
    // level4: 0.0015,
    // level5: 0.0014,
}

function getMapStructure(data, istransformed) {
    getBoundary(data) //获取地图边界
    var strokes = []
    loadFile(data, istransformed)
    return strokes

    // 河段类，包含起止节点、ID、Length、level等属性
    function Stroke() {
        this.id = null
        this.LengthKM = null
        this.fromNode = null
        this.toNode = null
        this.points = []
        this.level = null
    }

    function loadFile(data, istransformed) {
        let features = data.features
        let len = features.length
        for (let i = 0; i < len; i++) {
            let stroke = new Stroke()
            let line = data.features[i]
                // console.log(line.properties.ComID);
            stroke.id = line.properties.ComID
            stroke.LengthKM = line.properties.LengthKM
            stroke.fromNode = line.properties.FromNode
            stroke.toNode = line.properties.ToNode
            stroke.level = line.properties.StreamLeve
            if (istransformed) {
                // 将（x,y）坐标转换成Point结构，绘制树状河系
                stroke.points = transform(line.geometry.coordinates)
            } else {
                // 先不转换，判断冲突，改变计算的顺序
                var pts = line.geometry.coordinates
                for (var j = 0; j < pts.length; j++) {
                    var pt = new Point(pts[j][0], pts[j][1], j) //id也添加进去
                    stroke.points.push(pt)
                }
            }
            strokes.push(stroke)
        }
    }
}

// 节点数据结构
function Node(stroke = null, v = false) {
    //数据
    //this.id = null;
    if (stroke == null) {
        this.LengthKM = -1
        this.points = []
        this.level = -1
        this.startWid = null
        this.endWid = null
    } else {
        this.LengthKM = stroke.LengthKM
        this.points = stroke.points
        this.level = stroke.level
        this.fromNode = stroke.fromNode
        this.toNode = stroke.toNode
    }

    //标签
    this.virtual = v
        //关系
    this.parent = null
    this.left = null
    this.right = null
    this.depth = 0 //深度
}

//   构造二叉树
class BinaryTree {
    constructor(root) {
        this.root = root
        this.nodeNum = 1 //树节点个数,初始时有根节点
    }

    newTree(pNode) {
        //找孩子
        // this.nodeNum +=1;
        let children = [] //存储孩子
        for (let i = 0; i < stroke_array.length; i++) {
            let stroke = stroke_array[i]
            if (stroke.toNode == pNode.fromNode) {
                //找到孩子节点，新建节点
                let node = new Node(stroke, false)
                node.depth = pNode.depth + 1
                children.push(node)
                    // this.nodeNum += 1
            }
        }

        //更新孩子
        if (children.length == 0) {
            return
        } else if (children.length == 1) {
            this.nodeNum += 1
            pNode.left = children[0]
            children[0].parent = pNode
            this.newTree(children[0])
        } else if (children.length == 2) {
            //双孩子
            this.nodeNum += 2
            pNode.left = children[0]
            children[0].parent = pNode
            pNode.right = children[1]
            children[1].parent = pNode
            this.newTree(children[0])
            this.newTree(children[1])
        } //构造虚拟孩子
        else if (children.length == 3) {
            children = this.newVirtualNodes(pNode, children)
            for (let i = 0; i < children.length; i++) {
                this.newTree(children[i])
            }
        }
    }

    //虚节点的函数还是有点问题？？？把具有三个节点的函数写死
    //当找到的孩子节点大于2时，创建虚拟节点
    newVirtualNodes(parent, children) {
        //判断需要的虚节点的数量
        let minVirNum = Math.floor(children.length / 2)
            // let minVirNum = Math.floor(children.length / 2) * 2

        let nodes = []
        let stroke = null
        for (let i = 0; i < minVirNum; i++) {
            let virNode = new Node(stroke, true) //定义一个虚节点
            nodes.push(virNode)
        }
        nodes.push.apply(nodes, children) //将children拼接到nodes
        let currParent = parent //当前父亲
            //配对关系
        for (let i = 0; i < nodes.length; i += 2) {
            nodes[i].parent = currParent //更新父亲
            currParent.left = nodes[i + 1] //更新左孩子
            currParent.right = nodes[i] //更新右孩子
            nodes[i].depth = currParent.depth + 1 //更新深度

            nodes[i + 1].parent = currParent //更新父亲
            currParent = nodes[i]

            //指针抵达最后一个元素，防止i+1超出索引
            if (i >= nodes.length - 1) {
                break
            }
            // else {
            //   nodes[i + 1].parent = currParent //更新父亲
            //   currParent.right = nodes[i + 1] //更新孩子
            //   // nodes[i + 1].depth = currParent.depth + 1 //更新深度
            //   // currParent = nodes[i / 2 - 1] //更新当前父亲
            //   // console.log(currParent)
            // }
        }

        //返回孩子节点
        let temp = nodes.slice(0, 2)
            // return nodes.slice(minVirNum, nodes.length)
        return temp
    }

    //获取节点个数
    getnodeNum() {
        return this.nodeNum
    }

    //遍历使无分支河段收尾相接
    // connectBranch(node) {
    //   if (node == null) {
    //     return //递归基
    //   }

    //   //存在两个孩子
    //   if (node.left && node.right) {
    //     this.connectBranch(node.left)
    //     this.connectBranch(node.right)
    //   } else if (node.left) {
    //     node.points = addArrs(node.points, node.left.points)
    //   } else if (node.right) {
    //     node.points = addArrs(node.points, node.right.points)
    //   }

    //   let newNode = new Node()
    //   newNode = node.parent
    //   node.endWid = newNode.startWid
    //   this.draw(node.points, node.endWid, node) //根节点之外的节点插值计算
    // }

    //绘制树

    DrawTree() {
        this.DrawNode(this.root)

        let gl = getContextgl()
        draw_debug_riverNet(gl, wholeArr)
    }

    //遍历绘制
    DrawNode(node) {
        if (node == null) {
            return //递归基
        }
        //判断是虚节点
        if (!node.virtual) {
            //如果是根节点
            if (node == this.root) {
                switch (node.level) {
                    case 1:
                        node.endWid = widLevel.level1
                        break
                    case 2:
                        node.endWid = widLevel.level2
                        break
                    case 3:
                        node.endWid = widLevel.level3
                        break
                    case 4:
                        node.endWid = widLevel.level4
                        break
                    case (5, 6, 7, 8):
                        node.endWid = widLevel.level5
                        break
                }
                this.draw(node.points, node.endWid, node) //当为根节点时，设置开始节点
            } else {
                //当不是虚节点也不是根节点时
                let newNode = new Node()
                newNode = node.parent
                if (newNode.virtual) {
                    node.endWid = newNode.parent.startWid //虚节点没有线宽
                } else {
                    node.endWid = newNode.startWid
                }
                this.draw(node.points, node.endWid, node) //根节点之外的节点插值计算
            }
        } else {
            //当节点为虚节点时，不可能是根节点
            let newNode = new Node()
            newNode = node.parent
            node.left.endWid = newNode.startWid
            node.right.endWid = newNode.startWid

            // this.draw(node.left.points, node.left.endWid, node.left)
            // this.draw(node.right.points, node.right.endWid, node.right)
        }

        //绘制左右节点
        if (node.left != null) {
            this.DrawNode(node.left)
        }
        if (node.right != null) {
            this.DrawNode(node.right)
        }
    }

    draw(points, width, node) {
        let obj = get_Whole_Binaryarr(points, width)
        let pos = insertPts(points, width, true)

        node.startWid = pos.startWidth //小于startWid
        wholeArr.centralLine.push(obj.centralLine)
        wholeArr.originStrip.push(obj.originStrip)
        wholeArr.overlapTris.push(obj.overlapTris)
        wholeArr.newCentralLine.push(obj.newCentralLine)
        wholeArr.debugTriNet.push(obj.debugTriNet)
        wholeArr.newTriStrip.push(obj.newTriStrip)

        //把每一个计算结果放在wholeArr进行保存，每一段都单独绘制，最后将回执结果呈现在屏幕上
        //不能在这里绘制
        // draw_debug_riverNet(wholeArr)
    }
}

let wholeArr = {
    centralLine: [],
    originStrip: [],
    overlapTris: [],
    newCentralLine: [],
    debugTriNet: [],
    newTriStrip: [],
}

//构造森林
class Forest {
    constructor() {
        this.treeNum = 0 //树数量
        this.trees = []
    }

    newForest(stroke_array) {
        // 找树根
        for (let i = 0; i < stroke_array.length; i++) {
            let candRoot = stroke_array[i] //候选树根
            let realRoot = true
            for (let j = 0; j < stroke_array.length; j++) {
                let stroke = stroke_array[j]
                if (stroke.fromNode == candRoot.toNode) {
                    realRoot = false
                    break
                }
            }
            if (realRoot) {
                let rootNode = new Node(candRoot, false)
                let tree = new BinaryTree(rootNode)
                tree.newTree(rootNode) //得到这棵树
                    // tree.newTree(rootNode) //得到这棵树
                this.trees.push(tree)
            }
        }
    }

    //计算树数量
    TreeCount() {
        return trees.length
    }

    GetTree(id) {
        if (id > 0 && id < this.trees.length) {
            return this.trees[id]
        } else {
            return null
        }
    }

    DrawForest() {
        //绘制树木
        for (let i = 0; i < this.trees.length; i++) {
            let tree = this.trees[i]
            tree.DrawTree()
        }
        //刷新屏幕
    }
}

var boundary = {
    maxX: -1e8,
    minX: 1e8,
    maxY: -1e8,
    minY: 1e8,
}

// class BoundaryDict {
//   constructor(){
//     this._dict= {}
//   }
//   get(name){
//     return this._dict[name]||[]
//   }
//   add(name,bound){
//     this._dict[name] = bound
//   }
//   delete(name){
//     this._dict.slice(this._dict.indexOf(name),1)
//   }
// }

// boundaryDict = new BoundaryDict()

//将boundary恢复默认值
function clearBoundary() {
    boundary = {
        maxX: -1e8,
        minX: 1e8,
        maxY: -1e8,
        minY: 1e8,
    }
}
//输入参数为线段数组
function getMapSize(x, y) {
    if (boundary.maxX < x) {
        boundary.maxX = x
    }
    if (boundary.minX > x) {
        boundary.minX = x
    }
    if (boundary.maxY < y) {
        boundary.maxY = y
    }
    if (boundary.minY > y) {
        boundary.minY = y
    }
}

//由原始数据得到数据边界
function getBoundary(data) {
    let features = data.features
    let len = features.length
    let points = []
    for (let i = 0; i < len; i++) {
        let line = features[i]
        points = line.geometry.coordinates
        for (let j = 0; j < points.length; j++) {
            getMapSize(points[j][0], points[j][1]) //更新boundary
        }
    }
    console.log(boundary)
}

//将（x,y）转换成point,同时转换成webgl坐标
// points是（x,y）数组
function transform(points) {
    let vecs = []
    for (let i = 0; i < points.length; i++) {
        let x = points[i][0]
        let y = points[i][1]
            //转换到（-1,1）之间
        let scale = math.max((boundary.maxX - boundary.minX),(boundary.maxY - boundary.minY))
        x = (2 * (x - boundary.minX)) / scale - 1
        y = (2 * (y - boundary.minY)) / scale - 1
        let vec = new Point(x, y, i)
        vecs.push(vec)
    }
    return vecs
}

//points是Point类数组
function transform1(points) {
    let vecs = []
    for (let i = 0; i < points.length; i++) {
        let x = points[i].x
        let y = points[i].y
            //转换到（-1,1）之间
        x = ((2 * (x - boundary.minX)) / (boundary.maxX - boundary.minX) - 1) * 0.95
        y = ((2 * (y - boundary.minY)) / (boundary.maxY - boundary.minY) - 1) * 0.95
        let vec = new Point(x, y, i)
        vecs.push(vec)
    }
    return vecs
}

//points是Point类数组
function transform2(points, bound) {
    let vecs = []
    for (let i = 0; i < points.length; i++) {
        let x = points[i].x
        let y = points[i].y
            //转换到（-1,1）之间bound
        let scale = Math.max((bound.maxX - bound.minX),(bound.maxY - bound.minY))
        x = (2 * (x - bound.minX)) / scale - 1
        y = (2 * (y - bound.minY)) / scale - 1
        // x = ((2 * (x - bound.minX)) / (bound.maxX - bound.minX) - 1) * 0.95
        // y = ((2 * (y - bound.minY)) / (bound.maxY - bound.minY) - 1) * 0.95
        let vec = new Point(x, y, i)
        vecs.push(vec)
    }
    return vecs
}

//添加id,points是(x,y)数组
function addID(points) {
    let vecs = []
    for (let i = 0; i < points.length; i++) {
        let x = points[i][0]
        let y = points[i][1]
        let vec = new Point(x, y, i)
        vecs.push(vec)
    }
    return vecs
}

// 计算插值,isGradient表示是否需要渐变
function insertPts(vectors, width, isGradient) {
    if (vectors.length == 1) {
        vectors = []
        return vectors
    }

    var Points1 = [] //分别存储线段两侧的点
    var Points2 = []
    var len = vectors.length
    let x = vectors[1].x - vectors[0].x
    let y = vectors[1].y - vectors[0].y

    let v1 = new Point(-y, x)
    v1 = Point.normalize(v1) //单位化向量
    let v2 = new Point()
    let v3 = new Point()

    // v1.normalize();
    // v3.copy(v1);//保留方向向量

    x = (v1.x * width) / 2 + vectors[0].x
    y = (v1.y * width) / 2 + vectors[0].y
    v2.setX(x)
    v2.setY(y)
    Points1.push(v2)

    x = vectors[0].x - (v1.x * width) / 2
    y = vectors[0].y - (v1.y * width) / 2
    v3.setX(x)
    v3.setY(y)
    Points2.push(v3)

    var linewidth
    for (let i = 1; i < len - 1; i++) {
        //判断是否需要渐变
        if (isGradient) {
            linewidth = width - (width * 1) / len //线性渐变
                // var linewidth = width * (len-1-i)/ len;//线性渐变
        } else {
            linewidth = width //线性渐变
        }

        let vec1 = new Point()
        let vec2 = new Point()
        let vec3 = new Point()

        vec1 = Point.normalize(Point.subVector(vectors[i], vectors[i - 1])) //last to current 方向向量
            // console.log(1);
            // vec1.normalize();
        vec2 = Point.normalize(Point.subVector(vectors[i + 1], vectors[i])) //current to next 方向向量
            // vec2.normalize();
            // console.log(2);

        vec3 = Point.normalize(Point.addVector(vec1, vec2)) //对角线方向向量
            // vec3.normalize();
            // console.log(3);

        let normal = new Point(-vec1.y, vec1.x)
        let miter = new Point(-vec3.y, vec3.x)

        let angle_len = linewidth / 2 / Point.dot(normal, miter)

        let m = miter.x * angle_len
        let n = miter.y * angle_len
        x = m + vectors[i].x
        y = n + vectors[i].y
        let point1 = new Point(x, y)

        x = vectors[i].x - m
        y = vectors[i].y - n
        let point2 = new Point(x, y)

        Points1.push(point1)
        Points2.push(point2)
    }
    // console.log("----------");

    //计算终止结点处的插值点
    x = vectors[len - 1].x - vectors[len - 2].x
    y = vectors[len - 1].y - vectors[len - 2].y

    let v5 = new Point(-y, x)
    let v4 = new Point()

    v5 = Point.normalize(v5)
        // console.log("----------")
        // v4.copy(v5);

    x = (v5.x * linewidth) / 2 + vectors[len - 1].x
    y = (v5.y * linewidth) / 2 + vectors[len - 1].y
    v4.setX(x)
    v4.setY(y)
    Points1.push(v4)

    x = (-v5.x * linewidth) / 2 + vectors[len - 1].x
    y = (-v5.y * linewidth) / 2 + vectors[len - 1].y
    v5.setX(x)
    v5.setY(y)
    Points2.push(v5)

    var segment = {} //两条直线坐标数组,及宽度

    // 左直线：Points1；右直线：Points2.
    segment.pts1 = Points1
    segment.pts2 = Points2
    segment.startWidth = linewidth //保留结尾处的宽度
    return segment
}

//将线段左右插值转换成三角形串
function ptsToTriangles(pts1, pts2) {
    var position = []

    var len = pts1.length //两个数组的长度相等
    for (var i = 0; i < len - 1; i++) {
        position.push(pts1[i])
        position.push(pts2[i])
        position.push(pts1[i + 1])

        position.push(pts2[i])
        position.push(pts2[i + 1])
        position.push(pts1[i + 1])
    }
    return position //返回三角形串顶点数组
}

// 通过两平行线段点坐标，获得组成它的一系列三角形
function get_Tris(pts1, pts2) {
    var position = []
    var len = pts1.length //两个数组的长度相等

    for (var i = 0; i < len - 1; i++) {
        let T = new Triangle(pts1[i], pts2[i], pts1[i + 1], i, false) //i为id值
        position.push(T)
        let R = new Triangle(pts2[i], pts2[i + 1], pts1[i + 1], i, false) //i为id值
        position.push(R)
    }
    return position //返回三角形对象数组
}

// 转换成可以直接绘制的x,y数组
function toXYArray(points) {
    var xy = []
    var vectorToArray = function(item) {
        xy.push(item.x)
        xy.push(item.y)
    }
    points.forEach(vectorToArray)
    return xy
}

//将所有计算的结果存在同一个数组
// 绘制，检测，重绘,para:points:strokes
function get_Whole_arr(strokes, width, gl) {
    //计算了很多遍插值
    let line = []
    let array_line = []
    let array_overlaptri = []
    let newPts = []
    let array_debug = []
    let arr_newtringleStrip = []

    let calculate = function(arr) {
        line.push(toXYArray(transform1(arr))) //坐标转换

        array_line.push(draw_line_Tris(arr, width)) //原始剖分三角形坐标

        let obj = draw_Triobjs(arr, width) // 重叠三角形坐标
        array_overlaptri.push(obj.array)

        newPts.push(toXYArray(transform1(obj.newPts))) //已经删除处理后的坐标

        array_debug.push(draw_debug_Trinet(arr, width)) //debug三角网坐标

        arr_newtringleStrip.push(draw_line_Tris(obj.newPts, width)) //删除重叠部分三角形的坐标条带
    }

    for (var i = 0; i < strokes.length; i++) {
        calculate(strokes[i].points) //strokes[i]为一个Node
    }

    let object = {
        centralLine: line,
        originStrip: array_line,
        overlapTris: array_overlaptri,
        newCentralLine: newPts,
        debugTriNet: array_debug,
        newTriStrip: arr_newtringleStrip,
    }

    draw_debug_riverNet(gl, object)
}

//Draw with BinaryTree
function get_Whole_Binaryarr(points, width) {
    let centralLine = toXYArray(transform1(points)) //坐标转换

    let originStrip = draw_line_Tris(points, width) //原始剖分三角形坐标

    let obj = draw_Triobjs(points, width) // 重叠三角形坐标
    let overlapTris = obj.array

    let newCentralLine = toXYArray(transform1(obj.newPts)) //已经删除处理后的坐标

    let debugTriNet = draw_debug_Trinet(points, width) //debug三角网坐标

    let newTriStrip = draw_line_Tris(obj.newPts, width) //删除重叠部分三角形的坐标条带

    let object = {
        centralLine,
        originStrip,
        overlapTris,
        newCentralLine,
        debugTriNet,
        newTriStrip,
    }

    return object
}

//数组拼接
function addArrs(arr1, arr2) {
    var arr,
        Arr = arr2.reverse() //数组翻转
    if (
        Math.abs(arr1[0].x - arr2[0].x) < 1e-7 &&
        Math.abs(arr1[0].y - arr2[0].y) < 1e-7
    ) {
        arr = arr1.concat(arr2)
    } else {
        arr = arr1.concat(Arr)
    }
    return arr
}