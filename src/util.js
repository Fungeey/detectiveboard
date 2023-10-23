import { v4 as uuid } from 'uuid';

const deepDiffMapper = function () {
  return {
    VALUE_CREATED: 'created',
    VALUE_UPDATED: 'updated',
    VALUE_DELETED: 'deleted',
    VALUE_UNCHANGED: 'unchanged',
    map: function (obj1, obj2) {
      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        throw 'Invalid argument. Function given, object expected.';
      }
      if (this.isValue(obj1) || this.isValue(obj2)) {
        return {
          type: this.compareValues(obj1, obj2),
          data: obj1 === undefined ? obj2 : obj1
        };
      }

      var diff = {};
      for (var key in obj1) {
        if (this.isFunction(obj1[key])) {
          continue;
        }

        var value2 = undefined;
        if (obj2[key] !== undefined) {
          value2 = obj2[key];
        }

        diff[key] = this.map(obj1[key], value2);
      }
      for (var key in obj2) {
        if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
          continue;
        }

        diff[key] = this.map(undefined, obj2[key]);
      }

      return diff;

    },
    compareValues: function (value1, value2) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
        return this.VALUE_UNCHANGED;
      }
      if (value1 === undefined) {
        return this.VALUE_CREATED;
      }
      if (value2 === undefined) {
        return this.VALUE_DELETED;
      }
      return this.VALUE_UPDATED;
    },
    isFunction: function (x) {
      return Object.prototype.toString.call(x) === '[object Function]';
    },
    isArray: function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    },
    isDate: function (x) {
      return Object.prototype.toString.call(x) === '[object Date]';
    },
    isObject: function (x) {
      return Object.prototype.toString.call(x) === '[object Object]';
    },
    isValue: function (x) {
      return !this.isObject(x) && !this.isArray(x);
    }
  }
}();

const util = {
  posStyle: (pos) =>
    ({ transform: `translateX(${pos.x}px) translateY(${pos.y}px)` }),
  scaleStyle: (scale) =>
    ({ transform: `scale(${scale})` }),
  sizeStyle: (size) =>
    ({ width: `${size.width}px`, height: `${size.height}px` }),

  distance: (a, b) =>
    Math.sqrt(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) ^ 2),
  getMousePos: (e) => ({ x: e.clientX, y: e.clientY }),

  round: (num, decimals) =>
    Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),

  getUUID: type => type + "_" + uuid().substring(0, 5),

  isEmpty: obj => Object.keys(obj).length == 0,

  // Take an image URL, downscale it to the given width, and return a new image URL.
  downscaleImage: downscaleImage,

  objDiff: deepDiffMapper,
  clone: (obj) => JSON.parse(JSON.stringify(obj)),
  logObj: (obj) => console.log(util.clone(obj)),
  objIsEmpty: (obj) => Object.keys(obj).length === 0,

  addPos: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  subPos: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  mulPos: (v, s) => ({ x: v.x * s, y: v.y * s }),
  eqlPos: (a, b) => (a.x === b.x && a.y === b.y),
  eqlSize: (a, b) => (a.width === b.width && a.height === b.height),

  lineSize: (line) => {
    return {
      width: Math.round(Math.max(line.start.x, line.end.x) - Math.min(line.start.x, line.end.x) + 10),
      height: Math.round(Math.max(line.start.y, line.end.y) - Math.min(line.start.y, line.end.y) + 10)
    }
  },

  type: {
    note: "note",
    img: "img",
    scrap: "scrap",
    line: "line"
  },

  roundPos: (pos) => ({ x: Math.round(pos.x), y: Math.round(pos.y) }),
  LMB: 0,
  MMB: 1,
  RMB: 2,
  clickDist: 2
}

//https://stackoverflow.com/questions/14672746/how-to-compress-an-image-via-javascript-in-the-browser
async function downscaleImage(dataUrl, newWidth, imageType, imageArguments) {
  var oldWidth, oldHeight, newHeight, canvas, ctx, newDataUrl;

  // Provide default values
  imageType = imageType || "image/png";
  imageArguments = imageArguments || 0.7;

  // Create a temporary image so that we can compute the height of the    downscaled image.

  let image = await addImageProcess(dataUrl);

  function addImageProcess(src) {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  oldWidth = image.width;
  oldHeight = image.height;

  newWidth = 100;
  newHeight = Math.floor(oldHeight / oldWidth * newWidth)

  // Create a temporary canvas to draw the downscaled image on.
  canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Draw the downscaled image on the canvas and return the new data URL.
  ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, newWidth, newHeight);
  newDataUrl = canvas.toDataURL(imageType, imageArguments);

  return newDataUrl;
}



export default util;