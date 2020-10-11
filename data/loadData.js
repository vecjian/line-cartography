//利用二叉树重建河网拓扑结构
// 二叉树的节点为每一个河段
// 河段指的是从河源到汇口之间或者汇口和汇口之间的河流段

function getMapStructure(data) {
    let strokes = [];

    // 河段类，包含起止节点、ID、Length、level等属性
    function Stroke() {
        this.id = null;
        this.length = null;
        this.fromNode = null;
        this.toNode = null;
        this.points = [];
        this.level = null;
    }

    function loadFile(data) {
        let features = data.features;
        let len = features.length;
        for (let i = 0; i < len; i++) {
            let stroke = new Stroke();
            let line = data.features[i];
            console.log(line.properties.ComID);
            stroke.id = line.properties.ComID;
            stroke.length = line.properties.LengthKM;
            stroke.fromNode = line.properties.FromNode;
            stroke.toNode = line.properties.ToNode;
            stroke.level = line.properties.StreamLeve;
            stroke.points = line.geometry.coordinates;
            strokes.push(stroke);
        }
    }

    loadFile(data);
    return strokes;
}

//从strokes数组中找到某个节点的子节点
// function findChild(start_end_id) {
//     let strokes = [];

// }
function Node(value) {
    this.value = value;
    this.left = null;
    this.right = null;
}

let stroke_array = getMapStructure(originData);

function BinaryTree(root) {
    this.root = root;
    this.stroke_array = stroke_array;

    function constructTree(root) {
        let strokes = [];
        stroke = stroke_array.splice(0, 1);
        for (let i = 0; i < stroke_array.length; i++) {
            if (stroke_array[i].toNode == root.fromNode) {
                strokes.push(stroke_array[i]);
                stroke_array = stroke_array.splice(i, 1);
            }
        }

        if (strokes.length == 0) {
            return;
        }
        if (strokes.length == 1) {
            root.left = strokes[0];
            root.right = null;
            constructTree(strokes[0]);
        }
        if (strokes.length == 2) {
            root.left = strokes[0];
            root.right = strokes[1];
            constructTree(strokes[0]);
            constructTree(strokes[1]);
        }
        //当子节点个数多余1 时
        if (strokes.length > 2) {
            for (let i = 0; i < strokes.length; i++) {
                strokes[i].tag = root.value.id; //将根节点的id赋值给其每个节点进行标记；
            }
            constructTreeWithVirtualNode(root, strokes);
        }
    }

    //存在虚拟节点时，构造含有虚拟节点的树
    function constructTreeWithVirtualNode(root, array) {
        let virtual = new Node();
        if (array.length > 2) {
            root.left = virtual;
            array = array.splice(0, 1);
            constructTreeWithVirtualNode(root.right, array);
        }
    }

    //遍历子树的叶子结点
}

//从strokes_array的第一个元素开始遍历，得到所有的子树
function getWholeTree(stroke_array) {
    let trees = [];
    for (let i = 0; i < stroke_array.length; i++) {
        var root = new Node(stroke_array[i]);
        let riverTree = new BinaryTree(root);
        riverTree.constructTree(root);
        trees.push(riverTree);
    }
    return trees;
}

/*

//建立树结构
//参数：根节点
function RiverTree(root) {
    var Node = function(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    };

    this.root = root;


    var insertNode = function(node， newNode) {

        if (newNode == "undefined") {
            return;
        }
        if (node.left == null) {
            node.left = newNode;

        } else {
            insertNode(node.left, newNode);
        }

        if (node.right == null) {
            node.right = newNode;
        } else {
            insertNode(node.left, newNode);
        }
        return;
    }

    */