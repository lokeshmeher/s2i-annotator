export function addCanvas(img, $boxes, $parent){

  var canvas = document.createElement('canvas');
  let drag = false;

  canvas.rects = []
  var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
  var xform = svg.createSVGMatrix();
  var ctx = canvas.getContext('2d');

  var scale = ctx.scale;
  ctx.scale = function(sx,sy){
    xform = xform.scaleNonUniform(sx,sy);
    return scale.call(ctx,sx,sy);
  };

  var translate = ctx.translate;
  ctx.translate = function(dx,dy){
    xform = xform.translate(dx,dy);
    return translate.call(ctx,dx,dy);
  };

  var setTransform = ctx.setTransform;
  ctx.setTransform = function(a,b,c,d,e,f){
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx,a,b,c,d,e,f);
  };

  function draw(canvas) {
    var ctx = canvas.getContext('2d');
    for (var i in canvas.rects) {
      var rect = canvas.rects[i];
    
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
      ctx.lineWidth = 3 / xform.a;
      ctx.beginPath();
      ctx.rect(rect.startX, rect.startY, rect.endX - rect.startX, rect.endY - rect.startY);
      ctx.stroke();
    }
    //ctx.rect(canvas.width, 0, -canvas.width, canvas.height);
    //ctx.fill);
  }

  function drawImage(canvas) {
    canvas.getContext('2d').drawImage(canvas.img, 0, 0, canvas.width, canvas.height);
  }

  function transformCoord(x, o, s) {
    return ((x - o) / s ) + o 
  }

  function cleanup(rects) {
    var rects_ = []
    for (var i in rects) {
      var rect = rects[i];
      if ('endX' in rect && 'endY' in rect) {
        rects_.push(rect)
      }
    }
    return rects_ 
  }

  function mouseDown(e) {
    if (!drag) {
      canvas.rects = cleanup(canvas.rects);
      canvas.rects.push({});
      canvas.rects[canvas.rects.length - 1].startX = (e.offsetX - xform.e) / xform.a;
      canvas.rects[canvas.rects.length - 1].startY = (e.offsetY - xform.f) / xform.d;
      drag = true;
    }
    if (event.detail > 1) {
      return event.preventDefault();
    } 
  }

  function mouseUp(e) {
    drag = false;
  }

  function mouseMove(e) {
    if (drag) {
      var ctx = this.getContext('2d');
      canvas.rects[canvas.rects.length - 1].endX = (e.offsetX - xform.e) / xform.a;
      canvas.rects[canvas.rects.length - 1].endY = (e.offsetY - xform.f) / xform.d;
      ctx.clearRect(0, 0, this.width, this.height);
      drawImage(this);
      draw(this);
    }
  }

  function mouseWheel(e) {
    var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
    if (delta) {
      var ctx = this.getContext('2d');
      var pt = transformedPoint(e.offsetX, e.offsetY);
      ctx.translate(pt.x, pt.y);
      var factor = Math.pow(1.1, delta);
      ctx.scale(factor,factor);
      ctx.translate(-pt.x,-pt.y);
      if (xform.a < 1 || xform.d < 1) {ctx.setTransform(1, xform.b, xform.c, 1, xform.e, xform.f); }
      if (xform.e > 0) {ctx.setTransform(xform.a, xform.b, xform.c, xform.d, 0, xform.f)}
      if (xform.f > 0) {ctx.setTransform(xform.a, xform.b, xform.c, xform.d, xform.e, 0)}
      //if (xform.e + canvas.width > 0) {ctx.setTransform(xform.a, xform.b, xform.c, xform.d, canvas.width, xform.f)}
      //if (xform.f + canvas.height> 0) {ctx.setTransform(xform.a, xform.b, xform.c, xform.d, xform.e, canvas.height)}
      var p1 = transformedPoint(0,0);
      var p2 = transformedPoint(canvas.width,canvas.height);
      ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
      //console.log(ctx.canvas.height, canvas.height, this.height, xform);
      //ctx.clearRect(0, 0, this.width, this.height);
      drawImage(this);
      draw(this);
    }
    return e.preventDefault() && false;
  }

  function dblClick(e) {
    var x = (e.offsetX - xform.e) / xform.a;
    var y = (e.offsetY - xform.f) / xform.d;
    var idxToRemove = -1;
    var minArea = Number.MAX_VALUE;
    var l, t, r, b;
    for (var i in canvas.rects) {
      var rect = canvas.rects[i];
      l = Math.min(rect.startX, rect.endX), t = Math.min(rect.startY, rect.endY); 
      r = Math.max(rect.startX, rect.endX), b = Math.max(rect.startY, rect.endY); 
      if (x > l && x < r && y > t && y < b) {
        var area = (r - l) * (b - t);
        if (area < minArea) {
          minArea = area;
          idxToRemove = i;
        }
      }
    }

    if (idxToRemove != -1) {
      canvas.rects.splice(idxToRemove, 1);
      ctx.clearRect(0, 0, this.width, this.height);
      drawImage(this);
      draw(this);
    }
  }

  function transformedPoint(x,y){
    var pt  = svg.createSVGPoint();
    pt.x=x; pt.y=y;
    return pt.matrixTransform(xform.inverse());
  }

  function setRect(canvas, img) {
    // console.log(img.dataset);
    // var boxes = JSON.parse(img.dataset.boxes)
    // for (var i in $boxes) {
      // var box = boxes[i].split(',').map(Number);
    for (let box of $boxes) {
      canvas.rects.push({
        startX: box['x'] * canvas.width,
        startY: box['y'] * canvas.height,
        endX: (box['w'] + box['x']) * canvas.width,
        endY: (box['h'] + box['y']) * canvas.height,
      });
    }
  }

  function init() {
    canvas.width = img.width;
    canvas.height = img.height;
    // img.parentElement.appendChild(canvas);

    canvas.img = img;
    drawImage(canvas);
    canvas.drawImage = drawImage;

    setRect(canvas, img);
    draw(canvas);
    canvas.draw = draw;

    img.remove();

    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousewheel', mouseWheel, false);
    canvas.addEventListener('dblclick', dblClick, false);
  }

  init();
}