
const util = {
    posStyle: (pos) => ({transform:`translateX(${pos.x}px) translateY(${pos.y}px)`}),
    distance:(a, b) => Math.sqrt(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) ^ 2),
    getMousePos: (e) => ({x:e.clientX, y:e.clientY}),
    sizeStyle: (size) => ({width:`${size.width}px`, height:`${size.height}px`}),
    addPos: (a, b) => ({x:a.x+b.x, y:a.y+b.y}),
    subPos: (a, b) =>  ({x:a.x-b.x, y:a.y-b.y}),
    roundPos: (pos) => ({x:Math.round(pos.x), y:Math.round(pos.y)}),
    LMB: 0,
    MMB: 1,
    RMB: 2,
    clickDist:2
}

export default util;