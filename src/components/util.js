

const util = {
    posStyle: (pos) => ({transform:`translateX(${pos.x}px) translateY(${pos.y}px)`}),
    addPos: (a, b) => ({x:a.x+b.x, y:a.y+b.y}),
    subPos: (a, b) =>  ({x:a.x-b.x, y:a.y-b.y})
}

export default util;