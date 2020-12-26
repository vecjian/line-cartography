//各类形状
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
