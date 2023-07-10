
const util = {
    posStyle: (pos) => ({transform:`translateX(${pos.x}px) translateY(${pos.y}px)`}),
    distance:(a, b) => Math.sqrt(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) ^ 2),
    getMousePos: (e) => ({x:e.clientX, y:e.clientY}),
    sizeStyle: (width, height) => ({width:`${width}px`, height:`${height}px`}),
    addPos: (a, b) => ({x:a.x+b.x, y:a.y+b.y}),
    subPos: (a, b) =>  ({x:a.x-b.x, y:a.y-b.y}),
    LMB: 0,
    MMB: 1,
    RMB: 2,
    clickDist:2
}

export default util;