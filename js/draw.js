//着色器，绘制函数
//vertex shader
var v_Shader = `
attribute vec4 a_Position;
// varying vec2 v_pos;

void main(){
gl_Position = a_Position;
// v_pos = a_Position;
}`

//fragment shader
var f_Shader = `
precision mediump float;
uniform vec4 u_color;
// varying vec2 v_pos;
void main(){
    gl_FragColor = u_color;
}`

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
    var canvas = document.getElementById('canvas')
    var gl = canvas.getContext('webgl', { antialias: true })
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return gl
}

//获取GL句柄
function getContextgl1() {
    var canvas = document.getElementById('paint')
    var gl = canvas.getContext('webgl', { antialias: true })
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return gl
}
//获取GL句柄
function getContextgl2() {
    var canvas = document.getElementById('paint1')
    var gl = canvas.getContext('webgl', { antialias: true })
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return gl
}

//获取GL句柄
function getContextgl3() {
    var canvas = document.getElementById('paint2')
    var gl = canvas.getContext('webgl', { antialias: true })
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return gl
}
//获取GL句柄
function getContextgl4() {
    var canvas = document.getElementById('paint3')
    var gl = canvas.getContext('webgl', { antialias: true })
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return gl
}

//绘制渐变的河网，传入颜色(注意绘制二叉树时未传入颜色)
// para:  color=[r,g,b,a]
function drawRiver(array) {
    var gl = getContextgl()
    gl.clearColor(0.95, 0.95, 0.95, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var program = createProgram(gl, v_Shader, f_Shader)
    gl.useProgram(program.program)

    gl.uniform4fv(program.u_color, [0, 0, 1, 1])
    for (let i = 0; i < array.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array[i]))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        var n = array[i].length / 2
        gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
    }
}

// 绘制三角网
function drawTriNet(array) {
    var gl = getContextgl4()
    gl.clearColor(0.95, 0.95, 0.95, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var program = createProgram(gl, v_Shader, f_Shader)
    gl.useProgram(program.program)

    gl.uniform4fv(program.u_color, [0, 0, 0, 1])

    for (let i = 0; i < array.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array[i]))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        gl.drawArrays(gl.LINE_LOOP, 0, 3) //绘制DEBUG三角网
    }
}

//绘制原始剖分线、debug三角网、重叠三角形
// para:  color=[r,g,b,a]
function draw_three_objs(
    line,
    array_line,
    array_overlaptri,
    array_debug,
    newtriangleStrip,
    newLine
) {
    var gl = getContextgl4()
    gl.clearColor(0.95, 0.95, 0.95, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var program = createProgram(gl, v_Shader, f_Shader)
    gl.useProgram(program.program)

    //绘制原始剖分三角形
    gl.uniform4fv(program.u_color, [0.0, 0.2, 1.0, 0.7])
    for (let i = 0; i < array_line.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array_line[i]))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        var n = array_line[i].length / 2
        gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
    }

    //绘制中心线
    gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
    var riverBuffer = createBuffer(gl, new Float32Array(line))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = line.length / 2
    gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制中心线

    // 绘制变色重叠三角形
    if (array_overlaptri.length > 0) {
        gl.uniform4fv(program.u_color, [1.0, 0.0, 0.0, 1.0])
        for (let i = 0; i < array_overlaptri.length; i++) {
            var riverBuffer = createBuffer(gl, new Float32Array(array_overlaptri[i]))
            bindAttribute(gl, riverBuffer, program.a_Position, 2)
            n = array_overlaptri[i].length / 2
            gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
        }
    }

    //绘制三角网
    gl.uniform4fv(program.u_color, [0.8, 0.0, 0.0, 0.8])
    for (let i = 0; i < array_debug.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(array_debug[i]))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        gl.drawArrays(gl.LINE_LOOP, 0, 3) //绘制DEBUG三角网
    }

    //绘制新的三角剖分条带
    if (newtriangleStrip) {
        gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
        for (let i = 0; i < newtriangleStrip.length; i++) {
            riverBuffer = createBuffer(gl, new Float32Array(newtriangleStrip[i]))
            bindAttribute(gl, riverBuffer, program.a_Position, 2)
            n = newtriangleStrip[i].length / 2
            gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
        }
    }

    //绘制截取后的折线
    if (newLine) {
        gl.uniform4fv(program.u_color, [0.0, 0.6, 0.0, 0.8])
        var riverBuffer = createBuffer(gl, new Float32Array(newLine))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        n = newLine.length / 2
        gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制新的折线段
    }
}

// 三线、双线
function lines(gl, trianglestrip, debug, central) {
    // let gl = getContextgl1();
    gl.clearColor(0.95, 0.95, 0.95, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var program = createProgram(gl, v_Shader, f_Shader)
    gl.useProgram(program.program)

    //绘制双线
    let leftStrip = trianglestrip.leftStrip
    let rightStrip = trianglestrip.rightStrip
    let centralStrip = trianglestrip.centralStrip

    gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
    var riverBuffer = createBuffer(gl, new Float32Array(leftStrip))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = leftStrip.length / 2
    gl.drawArrays(gl.TRIANGLES, 0, n)
    if (debug) {
        gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
        gl.drawArrays(gl.LINE_STRIP, 0, n)
    }

    gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
    riverBuffer = createBuffer(gl, new Float32Array(rightStrip))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = rightStrip.length / 2
    gl.drawArrays(gl.TRIANGLES, 0, n)
    if (debug) {
        gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
        gl.drawArrays(gl.LINE_STRIP, 0, n)
    }

    // 绘制中心线背景;
    gl.uniform4fv(program.u_color, [1.0, 0.0, 0.0, 1.0])
    riverBuffer = createBuffer(gl, new Float32Array(centralStrip))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = centralStrip.length / 2
    gl.drawArrays(gl.TRIANGLES, 0, n)
    if (debug) {
        gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
        gl.drawArrays(gl.LINE_STRIP, 0, n)
    }

    //绘制三线
    if (central) {
        // 绘制中心线
        gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
        riverBuffer = createBuffer(gl, new Float32Array(trianglestrip.centralLine))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        n = trianglestrip.centralLine.length / 2
        gl.drawArrays(gl.LINES, 0, n)
    }
}

// 境界线
function drawBorder(trianglestrip, debug, central) {
    let gl = getContextgl3()
    gl.clearColor(0.95, 0.95, 0.95, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var program = createProgram(gl, v_Shader, f_Shader)
    gl.useProgram(program.program)

    //绘制双线
    let insideStrip = trianglestrip.insideStrip
    let outsideStrip = trianglestrip.outsideStrip

    gl.uniform4fv(program.u_color, [0.7, 0.7, 0.7, 1.0])
    riverBuffer = createBuffer(gl, new Float32Array(outsideStrip))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = outsideStrip.length / 2
    gl.drawArrays(gl.TRIANGLES, 0, n)
    if (debug) {
        gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
        gl.drawArrays(gl.LINE_STRIP, 0, n)
    }

    gl.uniform4fv(program.u_color, [0.5, 0.5, 0.5, 1.0])
    var riverBuffer = createBuffer(gl, new Float32Array(insideStrip))
    bindAttribute(gl, riverBuffer, program.a_Position, 2)
    n = insideStrip.length / 2
    gl.drawArrays(gl.TRIANGLES, 0, n)
    if (debug) {
        gl.uniform4fv(program.u_color, [0.0, 1.0, 0.0, 1.0])
        gl.drawArrays(gl.LINE_STRIP, 0, n)
    }

    if (central) {
        // 绘制中心线
        gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
        riverBuffer = createBuffer(gl, new Float32Array(trianglestrip.centralLine))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        n = trianglestrip.centralLine.length / 2
        gl.drawArrays(gl.LINE_STRIP, 0, n)
            // gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }
}

//同时绘制河网结构
//绘制原始剖分线、debug三角网、重叠三角形
function draw_debug_riverNet(obj) {
    let centralLine = obj.centralLine
    let originStrip = obj.originStrip
    let overlapTris = obj.overlapTris
    let newCentralLine = obj.newCentralLine
    let debugTriNet = obj.debugTriNet
    let newTriStrip = obj.newTriStrip

    var gl = getContextgl4()
    gl.clearColor(0.95, 0.95, 0.95, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var program = createProgram(gl, v_Shader, f_Shader)
    gl.useProgram(program.program)

    //绘制原始剖分三角形
    gl.uniform4fv(program.u_color, [0.0, 0.2, 1.0, 0.7])
    for (let i = 0; i < originStrip.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(originStrip[i]))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        var n = originStrip[i].length / 2
        gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
    }

    //绘制中心线
    gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
    for (let i = 0; i < centralLine.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(centralLine[i]))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        n = centralLine[i].length / 2
        gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制中心线
    }

    // 绘制变色重叠三角形
    gl.uniform4fv(program.u_color, [1.0, 0.0, 0.0, 1.0])
    for (let i = 0; i < overlapTris.length; i++) {
        if (overlapTris[i].length) {
            var riverBuffer = createBuffer(gl, new Float32Array(overlapTris[i]))
            bindAttribute(gl, riverBuffer, program.a_Position, 2)
            n = overlapTris[i].length / 2
            gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
        }
    }

    //绘制三角网
    gl.uniform4fv(program.u_color, [0.8, 0.0, 0.0, 0.8])
    for (let i = 0; i < debugTriNet.length; i++) {
        var riverBuffer = createBuffer(gl, new Float32Array(debugTriNet[i]))
        bindAttribute(gl, riverBuffer, program.a_Position, 2)
        gl.drawArrays(gl.LINE_LOOP, 0, 3) //绘制DEBUG三角网
    }

    //绘制新的三角剖分条带
    if (newTriStrip) {
        gl.uniform4fv(program.u_color, [0.0, 0.0, 0.0, 1.0])
        for (let i = 0; i < newTriStrip.length; i++) {
            riverBuffer = createBuffer(gl, new Float32Array(newTriStrip[i]))
            bindAttribute(gl, riverBuffer, program.a_Position, 2)
            n = newTriStrip[i].length / 2
            gl.drawArrays(gl.TRIANGLES, 0, n) //绘制多个三角形
        }
    }

    //绘制截取后的折线
    if (newCentralLine) {
        gl.uniform4fv(program.u_color, [0.0, 0.6, 0.0, 0.8])
        for (let i = 0; i < newCentralLine.length; i++) {
            var riverBuffer = createBuffer(gl, new Float32Array(newCentralLine[i]))
            bindAttribute(gl, riverBuffer, program.a_Position, 2)
            n = newCentralLine[i].length / 2
            gl.drawArrays(gl.LINE_STRIP, 0, n) //绘制新的折线段
        }
    }
}