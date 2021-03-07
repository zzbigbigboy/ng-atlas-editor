/**
 * 生成图片的缩略图
 * @param  {[type]} img    图片(img)对象或地址
 * @param  {[type]} width  缩略图宽
 * @param  {[type]} height 缩略图高
 * @return {[type]}        return base64 png图片字符串
 */
export function thumb_image(img, width, height) {
  if (typeof img !== "object") {
    var tem = new Image();
    tem.src = img;
    tem.setAttribute("crossOrigin", "Anonymous");
    img = tem;
  }
  img.onload = function (e) {
    var _canv = document.createElement("canvas");
    _canv.width = width;
    _canv.height = height;
    _canv
      .getContext("2d")
      .drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
    return _canv.toDataURL();
  };
}
/**
 * 把图片处理成圆形,如果不是正方形就按最小边一半为半径处理
 * @param  {[type]} img 图片(img)对象或地址
 * @return {[type]}     return base64 png图片字符串
 */
export async function yuan_image(img) {
  if (typeof img !== "object") {
    var tem = new Image();
    tem.src = img;
    tem.setAttribute("crossOrigin", "Anonymous");
    img = tem;
  }
  var w, h, _canv, _contex, cli;
  return new Promise((resolve, rejext) => {
    img.onload = function (e) {
      // console.log(e)
      if (img.width > img.height) {
        w = img.height;
        h = img.height;
      } else {
        w = img.width;
        h = img.width;
      }
      _canv = document.createElement("canvas");
      _canv.width = w;
      _canv.height = h;
      _contex = _canv.getContext("2d");
      cli = {
        x: w / 2,
        y: h / 2,
        r: w / 2,
      };
      _contex.clearRect(0, 0, w, h);
      _contex.save();
      _contex.beginPath();
      _contex.arc(cli.x, cli.y, cli.r, 0, Math.PI * 2, false);
      _contex.clip();
      _contex.drawImage(img, 0, 0);
      const string = _canv.toDataURL();
      // console.log(string)
      resolve(string);
    };
  });
}

export function yuan_images(nodes, callback) {
  console.log(nodes);
  if (nodes.length < 1) {
    callback(nodes);
    return;
  }
  const array = nodes;
  let count = 0;
  const isCallBack = (length) => {
    if (count >= length) {
      callback(array);
    }
  };
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].img) {
      yuan_image(nodes[i].img).then((string) => {
        count++;
        array[i].img = string;
        isCallBack(nodes.length);
      });
    } else {
      count++;
      isCallBack(nodes.length);
    }
  }
}
