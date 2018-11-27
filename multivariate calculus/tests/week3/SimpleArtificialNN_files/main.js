// © A. Freddie Page - 2017 - Imperial College London
// http://fourier.space/
var MODULE = (function () {
  "use strict";
  var that = {};
  var X0 = [0,0], dX = [0,0], z00=0.45, z0 = 0.45;
  var el = that.el = {};
  var xScale, yScale;
  var inputFn;
  var w1_00, w1_01, b1_0, b1_1, w2_00, w2_10, b2_0;
  var a1_0, a1_1, a2_0;
  var σ;
  var grade = false;

  inputFn = function () {
    w1_00 = +el["W1_00"].value;
    w1_01 = +el["W1_01"].value;
    b1_0 = +el["B1_0"].value;
    b1_1 = +el["B1_1"].value;
    w2_00 = +el["W2_00"].value;
    w2_10 = +el["W2_10"].value;
    b2_0 = +el["B2_0"].value;
    z0 = +el["X"].value;
    that.redraw();
  };

  σ = function (z) {
    return 1/(1+Math.exp(-z));
  };

  a1_0 = function (x) {
    return σ(w1_00 * x + b1_0);
  };

  a1_1 = function (x) {
    return σ(w1_01 * x + b1_1);
  };

  a2_0 = function (x) {
    return σ(w2_00 * a1_0(x) + w2_10 * a1_1(x) + b2_0);
  };

  that.redraw = function () {
    var x0 = 55.123835, y0 = 689.57214; // Page Coordinates
    var fxStr = "", gxStr = "";
    var f, g, inRange;
    for (var i = 0; i < 512; i += 1) {
      f = a2_0(i/512);
      fxStr += (i?" L ":" M ") + (x0 + xScale*i/512) + "," + (y0 + yScale * f)
    }
    el["y"].setAttribute("d", fxStr);
    el["blob"].setAttribute("d", "M " + (x0+xScale*z0) + "," + y0 + " L " + (x0+xScale*z0) + "," + (y0+yScale*a2_0(z0) ));
    el["a0_0"].style.opacity = z0;
    el["a1_0"].style.opacity = a1_0(z0);
    el["a1_1"].style.opacity = a1_1(z0);
    el["a2_0"].style.opacity = a2_0(z0);

    if (grade) {
      courseraApi.callMethod({
        type: "SET_ANSWER",
        data: {
          answer: { learnerClick: true },
          evaluation: {
            isCorrect: true,
            feedback: "Continue to use this tool to get a feel for neural network weights and biases.",
            feedbackConfiguration: null
          }
        }
      });
      grade = false;
    }
  };

  that.init = function () {
    ["root", "layer1", "initText", "graph", "xAxis", "yAxis", "y", "blob",
      "W1_00", "W1_01", "B1_0", "B1_1", "W2_00", "W2_10", "B2_0", "X",
      "a0_0", "a1_0", "a1_1", "a2_0"
    ].map(
      function (id) {
        el[id] = document.getElementById(id);
      });

    xScale = el["xAxis"].getBBox().width;
    yScale = -el["yAxis"].getBBox().height;

    el["graph"].style.cursor = "pointer";
    X0 = [el["blob"].getBBox().x + 206, el["blob"].getBBox().y]; // Why 23 is a mystery to me.

    var mousePressed = false;
    el["graph"].onmousemove = function (e) {
      if (!mousePressed) {
        return e.preventDefault();
      }
      el["graph"].style.cursor = "grabbing";
      dX = [e.clientX - X0[0], e.clientY - X0[1]]
      z0 = Math.min(Math.max(z00 + dX[0]/xScale, 0), 1);
      el["X"].value = z0;
      that.redraw();
      return e.preventDefault();
    };
    el["graph"].onmouseup = function (e) {
      mousePressed = false;
      el["graph"].style.cursor = "pointer";
      return e.preventDefault();
    };
    el["graph"].onmousedown = function (e) {
      mousePressed = true
      return el["graph"].onmousemove(e);
    };

    el["root"].ondragstart = function (e) { return e.preventDefault(); };

    ["W1_00", "W1_01", "B1_0", "B1_1", "W2_00", "W2_10", "B2_0", "X"].map(function (id) {
      el[id].oninput = inputFn;
      el[id].value = {
        "W1_00": 10,
        "W1_01": -10,
        "B1_0": -6.2,
        "B1_1": 3.5,
        "W2_00": -10,
        "W2_10": -10,
        "B2_0": 5.3}[id];
    });

    inputFn();
    that.redraw()
    grade = true;

    document.body.onclick = null;
    el["layer1"].style.filter = null;
    el["initText"].style.display = "none";
  };

  return that;
}());
