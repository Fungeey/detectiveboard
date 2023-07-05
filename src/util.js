
const util = {
    posStyle: (pos) => ({transform:`translateX(${pos.x}px) translateY(${pos.y}px)`}),
    sizeStyle: (width, height) => ({width:`${width}px`, height:`${height}px`}),
    addPos: (a, b) => ({x:a.x+b.x, y:a.y+b.y}),
    subPos: (a, b) =>  ({x:a.x-b.x, y:a.y-b.y}),
    LMB: 0,
    RMB: 2
}

export default util;