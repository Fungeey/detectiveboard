import { v4 as uuid } from 'uuid';

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
    downscaleImage:downscaleImage,

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

    roundPos: (pos) => ({ x: Math.round(pos.x), y: Math.round(pos.y) }),
    LMB: 0,
    MMB: 1,
    RMB: 2,
    clickDist: 2
}

//https://stackoverflow.com/questions/14672746/how-to-compress-an-image-via-javascript-in-the-browser
async function downscaleImage(dataUrl, newWidth, imageType, imageArguments){
    var oldWidth, oldHeight, newHeight, canvas, ctx, newDataUrl;

    // Provide default values
    imageType = imageType || "image/png";
    imageArguments = imageArguments || 0.7;

    // Create a temporary image so that we can compute the height of the    downscaled image.

    let image = await addImageProcess(dataUrl);

    function addImageProcess(src){
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = src
        })
    }

    oldWidth = image.width;
    oldHeight = image.height;

    newWidth = 1000;
    newHeight = Math.floor(oldHeight / oldWidth * newWidth)

    // Create a temporary canvas to draw the downscaled image on.
    canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw the downscaled image on the canvas and return the new data URL.
    ctx = canvas.getContext("2d");
    console.log(ctx);
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    newDataUrl = canvas.toDataURL(imageType, imageArguments);

    return newDataUrl;
}

export default util;