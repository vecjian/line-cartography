//利用二叉树重建河网拓扑结构
// 二叉树的节点为每一个河段
// 河段指的是从河源到汇口之间或者汇口和汇口之间的河流段
let widLevel = {
    level1: 0.04,
    level2: 0.015,
    level3: 0.01,
    level4: 0.008,
    level5: 0.006,
};

function getMapStructure(data, istransformed) {
    getBoundary(data); //获取地图边界
    var strokes = [];
    loadFile(data, istransformed);
    return strokes;

    // 河段类，包含起止节点、ID、Length、level等属性
    function Stroke() {
        this.id = null;
        this.LengthKM = null;
        this.fromNode = null;
        this.toNode = null;
        this.points = [];
        this.level = null;
    }

    function loadFile(data, istransformed) {
        let features = data.features;
        let len = features.length;
        for (let i = 0; i < len; i++) {
            let stroke = new Stroke();
            let line = data.features[i];
            // console.log(line.properties.ComID);
            stroke.id = line.properties.ComID;
            stroke.LengthKM = line.properties.LengthKM;
            stroke.fromNode = line.properties.FromNode;
            stroke.toNode = line.properties.ToNode;
            stroke.level = line.properties.StreamLeve;
            if (istransformed) {
                // 将（x,y）坐标转换成Point结构，绘制树状河系
                stroke.points = transform(line.geometry.coordinates);
                console.log(stroke.points);
            } else {
                // 先不转换，判断冲突，改变计算的顺序
                var pts = line.geometry.coordinates;
                for (var j = 0; j < pts.length; j++) {
                    var pt = new Point(pts[j][0], pts[j][1]);
                    stroke.points.push(pt);
                }
            }
            strokes.push(stroke);
        }
        console.log(strokes);
    }

}

// 节点数据结构
function Node(stroke = null, v = false) {
    //数据
    //this.id = null;
    if (stroke == null) {
        this.LengthKM = -1;
        this.points = [];
        this.level = -1;
        this.startWid = null;
        this.endWid = null;
    } else {
        this.LengthKM = stroke.LengthKM;
        this.points = stroke.points;
        this.level = stroke.level;
        this.fromNode = stroke.fromNode;
        this.toNode = stroke.toNode;
    }

    //标签
    this.virtual = v;
    //关系
    this.parent = null;
    this.left = null;
    this.right = null;
    this.depth = 0; //深度
}

// 构造二叉树
class BinaryTree {
    constructor(root) {
        this.root = root;
        this.nodeNum = 1; //树节点个数,初始时有根节点
    }

    newTree(pNode) {
        //找孩子
        // this.nodeNum +=1;
        let children = []; //存储孩子
        for (let i = 0; i < stroke_array.length; i++) {
            let stroke = stroke_array[i];
            if (stroke.toNode == pNode.fromNode) {
                //找到孩子节点，新建节点
                let node = new Node(stroke, false);
                node.depth = pNode.depth + 1;
                children.push(node);
            }
        }

        //更新孩子
        if (children.length == 0) {
            return;
        } else if (children.length == 1) {
            this.nodeNum += 1;
            pNode.left = children[0];
            children[0].parent = pNode;
            this.newTree(children[0]);
        } else if (children.length == 2) {
            //双孩子
            this.nodeNum += 2;
            pNode.left = children[0];
            children[0].parent = pNode;
            pNode.right = children[1];
            children[1].parent = pNode;
            this.newTree(children[0]);
            this.newTree(children[1]);
        } //构造虚拟孩子
        else {
            let children = newVirtualNodes(pNode, children);
            for (let i = 0; i < children.length; i++) {
                this.newTree(children[i]);
            }
        }
    }

    //当找到的孩子节点大于2时，创建虚拟节点
    newVirtualNodes(parent, children) {
        //判断需要的虚节点的数量
        minVirNum = Math.floor(children.length / 2) * 2;

        let nodes = [];
        let stroke = null;
        for (let i = 0; i < minVirNum; i++) {
            let virNode = new Node(stroke, true);
            nodes.push(virNode);
        }
        nodes.push.apply(nodes, children); //将children拼接到nodes
        let currParent = parent; //当前父亲
        //配对关系
        for (let i = 0; i < nodes.length; i += 2) {
            nodes[i].parent = currParent; //更新父亲
            currParent.left = nodes[i]; //更新左孩子
            currParent.right = nodes[i + 1]; //更新右孩子
            nodes[i].depth = currParent.depth + 1; //更新深度

            if (i >= nodes.length - 1) break; //指针抵达最后一个元素，防止i+1超出索引
            nodes[i + 1].parent = currParent; //更新父亲
            currParent.right = nodes[i + 1]; //更新孩子
            nodes[i + 1].depth = currParent.depth + 1; //更新深度
            currParent = nodes[i / 2 - 1]; //更新当前父亲
        }
        //返回孩子节点
        return nodes.slice(minVirNum, nodes.length);
    }

    //获取节点个数
    getnodeNum() {
        return this.nodeNum;
    }

    //绘制树
    DrawTree() {
        this.DrawNode(this.root);
        let color = [0.0, 0.0, 1.0, 1.0];
        drawRiver(wholeArr, color);
    }

    //遍历绘制
    DrawNode(node) {
        if (node == null) {
            // drawRiver(wholeArr);//所有树枝都在一个数组里边画
            return; //递归基
        }
        if (!node.virtual) {
            if (node == this.root) {
                switch (node.level) {
                    case 1:
                        node.endWid = widLevel.level1;
                        break;
                    case 2:
                        node.endWid = widLevel.level2;
                        break;
                    case 3:
                        node.endWid = widLevel.level3;
                        break;
                    case 4:
                        node.endWid = widLevel.level4;
                        break;
                    case (5, 6, 7, 8):
                        node.endWid = widLevel.level5;
                        break;
                }
                this.draw(node.points, node.endWid, node); //当为根节点时，设置开始节点
                // this.draw(node.points, 1,node); //当为根节点时，设置开始节点
            } else {
                let newNode = new Node();
                newNode = node.parent;
                // node.endWid = newNode.startWid;
                node.endWid = newNode.startWid;
                this.draw(node.points, node.endWid, node); //根节点之外的节点插值计算
            }
        }
        if (node.left != null) {
            this.DrawNode(node.left);
        }
        if (node.right != null) {
            this.DrawNode(node.right);
        }
    }

    draw(points, width, node) {
        let pos = insertPts(points, width);
        let branch = {};
        branch.position = toXYArray(ptsToTriangles(pos.pts1, pos.pts2)); //转化为三角形的xy,坐标序列
        branch.startWid = pos.startWidth;
        let array = branch.position;
        wholeArr.push(array);
        node.startWid = branch.startWid; //小于startWid
        let color = [0.0, 0.0, 1.0, 1.0];
        drawRiver(wholeArr, color);
    }
}

let wholeArr = [];
//构造森林
class Forest {
    constructor() {
        this.treeNum = 0; //树数量
        this.trees = [];
    }

    newForest(stroke_array) {
        // 找树根
        for (let i = 0; i < stroke_array.length; i++) {
            let candRoot = stroke_array[i]; //候选树根
            let realRoot = true;
            for (let j = 0; j < stroke_array.length; j++) {
                let stroke = stroke_array[j];
                if (stroke.fromNode == candRoot.toNode) {
                    realRoot = false;
                    break;
                }
            }
            if (realRoot) {
                let rootNode = new Node(candRoot, false);
                let tree = new BinaryTree(rootNode);
                tree.newTree(rootNode); //得到这棵树
                this.trees.push(tree);
            }
        }
    }

    //计算树数量
    TreeCount() {
        return trees.length;
    }

    GetTree(id) {
        if (id > 0 && id < this.trees.length) {
            return this.trees[id];
        } else {
            return null;
        }
    }

    DrawForest() {
        //绘制树木
        for (let i = 0; i < this.trees.length; i++) {
            let tree = this.trees[i];
            tree.DrawTree();
        }
        //刷新屏幕
    }
}


let boundary = {
    maxX: -1e3,
    minX: 1e3,
    maxY: -1e3,
    minY: 1e3,
};

//输入参数为线段数组
function getMapSize(x, y) {
    if (boundary.maxX < x) {
        boundary.maxX = x;
    }
    if (boundary.minX > x) {
        boundary.minX = x;
    }
    if (boundary.maxY < y) {
        boundary.maxY = y;
    }
    if (boundary.minY > y) {
        boundary.minY = y;
    }
}

//由原始数据得到数据边界
function getBoundary(data) {
    let features = data.features;
    let len = features.length;
    let points = [];
    for (let i = 0; i < len; i++) {
        let line = data.features[i];
        points = line.geometry.coordinates;
        for (let j = 0; j < points.length; j++) {
            getMapSize(points[j][0], points[j][1]); //更新boundary
        }
    }
    console.log(boundary.minX, boundary.maxX, boundary.minY, boundary.maxY);
}

//将（x,y）转换成point,同时转换成webgl坐标
// points是（x,y）数组
function transform(points) {
    let vecs = [];
    for (let i = 0; i < points.length; i++) {
        let x = points[i][0];
        let y = points[i][1];
        //转换到（-1,1）之间
        x = (2 * (x - boundary.minX)) / (boundary.maxX - boundary.minX) - 1;
        y = (2 * (y - boundary.minY)) / (boundary.maxY - boundary.minY) - 1;
        let vec = new Point(x, y);
        vecs.push(vec);
    }
    return vecs;
}

//points是Point类数组
function transform1(points) {
    let vecs = [];
    for (let i = 0; i < points.length; i++) {
        let x = points[i].x;
        let y = points[i].y;
        //转换到（-1,1）之间
        x = (2 * (x - boundary.minX)) / (boundary.maxX - boundary.minX) - 1;
        y = (2 * (y - boundary.minY)) / (boundary.maxY - boundary.minY) - 1;
        let vec = new Point(x, y);
        vecs.push(vec);
    }
    return vecs;
}



// 计算插值
function insertPts(vectors, width) {
    if (vectors.length == 1) {
        vectors = [];
        return vectors;
    }

    var Points1 = []; //分别存储线段两侧的点
    var Points2 = [];
    var len = vectors.length;
    let x = vectors[1].x - vectors[0].x;
    let y = vectors[1].y - vectors[0].y;

    let v1 = new Point(-y, x);
    v1 = Point.normalize(v1); //单位化向量
    let v2 = new Point();
    let v3 = new Point();

    // v1.normalize();
    // v3.copy(v1);//保留方向向量

    x = (v1.x * width) / 2 + vectors[0].x;
    y = (v1.y * width) / 2 + vectors[0].y;
    v2.setX(x);
    v2.setY(y);
    Points1.push(v2);

    x = vectors[0].x - (v1.x * width) / 2;
    y = vectors[0].y - (v1.y * width) / 2;
    v3.setX(x);
    v3.setY(y);
    Points2.push(v3);

    var linewidth;
    for (let i = 1; i < len - 1; i++) {
        // linewidth = width - (width * 1) / len; //线性渐变
        // var linewidth = width * (len-1-i)/ len;//线性渐变
        linewidth = width //线性渐变

        let vec1 = new Point();
        let vec2 = new Point();
        let vec3 = new Point();

        vec1 = Point.normalize(Point.subVector(vectors[i], vectors[i - 1])); //last to current 方向向量
        // console.log(1);
        // vec1.normalize();
        vec2 = Point.normalize(Point.subVector(vectors[i + 1], vectors[i])); //current to next 方向向量
        // vec2.normalize();
        // console.log(2);

        vec3 = Point.normalize(Point.addVector(vec1, vec2)); //对角线方向向量
        // vec3.normalize();
        // console.log(3);

        let normal = new Point(-vec1.y, vec1.x);
        let miter = new Point(-vec3.y, vec3.x);

        let angle_len = linewidth / 2 / Point.dot(normal, miter);

        let m = miter.x * angle_len;
        let n = miter.y * angle_len;
        x = m + vectors[i].x;
        y = n + vectors[i].y;
        let point1 = new Point(x, y);

        x = vectors[i].x - m;
        y = vectors[i].y - n;
        let point2 = new Point(x, y);

        Points1.push(point1);
        Points2.push(point2);
    }
    // console.log("----------");

    //计算终止结点处的插值点
    x = vectors[len - 1].x - vectors[len - 2].x;
    y = vectors[len - 1].y - vectors[len - 2].y;

    let v5 = new Point(-y, x);
    let v4 = new Point();

    v5 = Point.normalize(v5);
    // console.log("----------")
    // v4.copy(v5);

    x = (v5.x * linewidth) / 2 + vectors[len - 1].x;
    y = (v5.y * linewidth) / 2 + vectors[len - 1].y;
    v4.setX(x);
    v4.setY(y);
    Points1.push(v4);

    x = (-v5.x * linewidth) / 2 + vectors[len - 1].x;
    y = (-v5.y * linewidth) / 2 + vectors[len - 1].y;
    v5.setX(x);
    v5.setY(y);
    Points2.push(v5);

    var segment = {}; //两条直线坐标数组,及宽度

    segment.pts1 = Points1;
    segment.pts2 = Points2;
    segment.startWidth = linewidth; //保留结尾处的宽度
    return segment;
}

//将线段左右插值转换成三角形串
function ptsToTriangles(pts1, pts2) {
    var position = [];

    var len = pts1.length; //两个数组的长度相等
    for (var i = 0; i < len - 1; i++) {
        position.push(pts1[i]);
        position.push(pts2[i]);
        position.push(pts1[i + 1]);

        position.push(pts2[i]);
        position.push(pts2[i + 1]);
        position.push(pts1[i + 1]);
    }
    return position; //返回三角形串顶点数组
}

// 通过两平行线段点坐标，获得组成它的一系列三角形
function get_Tris(pts1, pts2) {
    var position = [];
    var len = pts1.length; //两个数组的长度相等

    for (var i = 0; i < len - 1; i++) {
        let T = new Triangle(pts1[i], pts2[i], pts1[i + 1], "undefined", false);
        position.push(T);
        let R = new Triangle(pts2[i], pts2[i + 1], pts1[i + 1], "undefined", false);
        position.push(R);
    }
    return position; //返回三角形对象数组
}

// 转换成可以直接绘制的x,y数组
function toXYArray(points) {
    var xy = [];
    var vectorToArray = function(item) {
        xy.push(item.x);
        xy.push(item.y);
    };
    points.forEach(vectorToArray);
    return xy;
}

//绘制，着色器，绘制函数
//vertex shader
var v_Shader = `
attribute vec4 a_Position;
// varying vec2 v_pos;

void main(){
gl_Position = a_Position;
// v_pos = a_Position;
}`;

//fragment shader
var f_Shader = `
precision mediump float;
uniform vec4 u_color;
// varying vec2 v_pos;
void main(){
    gl_FragColor = u_color;
}`;

/*
//更改传入颜色
var v_Shader = `
attribute vec4 a_Position;
attribute vec4 a_color;

varying vec4 v_color;

void main (){
    gl_Position = a_Position;
    v_color = a_color;
}`;

//uniform vec4 u_Color;

var f_Shader = `
precision mediump float;
varying vec4 v_color;
void main(){
    gl_FragColor = v_color; 
}`;*/

// 获得GL句柄
function getContextgl() {
    var canvas = document.getElementById("webgl");
    var gl = canvas.getContext("webgl", { antialias: true });
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return gl;
}

//绘制渐变的河网，传入颜色(注意绘制二叉树时未传入颜色)
// para:  color=[r,g,b,a]
function drawRiver(array, color) {
    var gl = getContextgl();
    gl.clearColor(0.95, 0.95, 0.95, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var program = createProgram(gl, v_Shader, f_Shader);
    gl.useProgram(program.program);

    gl.uniform4fv(program.u_color, color);

    var length = array.length;
    console.log(length);
    for (let i = 0; i < array.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array[i]));
        bindAttribute(gl, riverBuffer, program.a_Position, 2);
        var n = array[i].length / 2;
        gl.drawArrays(gl.TRIANGLES, 0, n); //绘制多个三角形
    }
}

// 绘制三角网
function drawTriNet(array) {
    var gl = getContextgl();
    gl.clearColor(0.95, 0.95, 0.95, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var program = createProgram(gl, v_Shader, f_Shader);
    gl.useProgram(program.program);

    gl.uniform4fv(program.u_color, [0, 0, 0, 1]);

    for (let i = 0; i < array.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array[i]));
        bindAttribute(gl, riverBuffer, program.a_Position, 2);
        gl.drawArrays(gl.LINE_LOOP, 0, 3); //绘制DEBUG三角网    
    }
}


//绘制原始剖分线、debug三角网、重叠三角形
// para:  color=[r,g,b,a]
function draw_three_objs(line, array_line, array_overlaptri, array_debug) {
    var gl = getContextgl();
    gl.clearColor(0.95, 0.95, 0.95, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var program = createProgram(gl, v_Shader, f_Shader);
    gl.useProgram(program.program)



    //绘制原始剖分三角形
    gl.uniform4fv(program.u_color, [0.0, 0.2, 1.0, 0.7]);
    for (let i = 0; i < array_line.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array_line[i]));
        bindAttribute(gl, riverBuffer, program.a_Position, 2);
        var n = array_line[i].length / 2;
        gl.drawArrays(gl.TRIANGLES, 0, n); //绘制多个三角形
    }

    //绘制中心线
    // gl.uniform4fv(program.u_color, [0.0, 0.5, 0.0, 0.5]);
    gl.uniform4fv(program.u_color, [0.0, 0.9, 0.0, 1.0]);
    var riverBuffer = createBuffer(gl, new Float32Array(line));
    bindAttribute(gl, riverBuffer, program.a_Position, 2);
    var n = line.length / 2;
    gl.drawArrays(gl.LINE_STRIP, 0, n); //绘制DEBUG三角网    

    // 绘制变色重叠三角形
    if (array_overlaptri.length > 0) {
        gl.uniform4fv(program.u_color, [1.0, 0.0, 0.0, 1.0]);
        for (let i = 0; i < array_overlaptri.length; i++) {
            var riverBuffer = createBuffer(gl, new Float32Array(array_overlaptri[i]));
            bindAttribute(gl, riverBuffer, program.a_Position, 2);
            var n = array_overlaptri[i].length / 2;
            gl.drawArrays(gl.TRIANGLES, 0, n); //绘制多个三角形
        }
    }



    //绘制三角网
    gl.uniform4fv(program.u_color, [0.8, 0.0, 0.0, 0.8]);
    for (let i = 0; i < array_debug.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array_debug[i]));
        bindAttribute(gl, riverBuffer, program.a_Position, 2);
        gl.drawArrays(gl.LINE_LOOP, 0, 3); //绘制DEBUG三角网    
    }
}