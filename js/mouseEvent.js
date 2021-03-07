//鼠标事件

function mouse() {
  var a
  var b
  var a1
  var b1
  var x
  var y
  document.οnmοusedοwn = function (ev) {
    a = ev.screenX
    b = ev.screenY
  }
  document.οnmοuseup = function (ev) {
    a1 = ev.screenX
    b1 = ev.screenY
    // console.log(Math.sqrt(Math.pow(a - a1, 2) + (b - b1), 2))
    x = a1 - a
    y = b1 - b
    console.log(x, y)
  }
  document.οnmοuseup(window.Event)
}

// mouse()
