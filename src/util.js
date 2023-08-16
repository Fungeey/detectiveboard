import { v4 as uuid } from 'uuid';

const util = {
    posStyle: (pos) => ({transform:`translateX(${pos.x}px) translateY(${pos.y}px)`}),
    scaleStyle: (scale) => ({transform:`scale(${scale})`}),
    sizeStyle: (size) => ({width:`${size.width}px`, height:`${size.height}px`}),

    distance:(a, b) => Math.sqrt(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) ^ 2),
    getMousePos: (e) => ({x:e.clientX, y:e.clientY}),

    round:(num, decimals) => 
        Math.round(num * Math.pow(10, decimals))/Math.pow(10, decimals),

    getUUID: type => type + "_" + uuid().substring(0, 5),

    addPos: (a, b) => ({x:a.x+b.x, y:a.y+b.y}),
    subPos: (a, b) =>  ({x:a.x-b.x, y:a.y-b.y}),
    mulPos: (v, s) => ({x:v.x*s, y:v.y*s}),
    eqlPos: (a, b) => (a.x===b.x && a.y===b.y),
    eqlSize: (a, b) => (a.width===b.width && a.height===b.height),

    roundPos: (pos) => ({x:Math.round(pos.x), y:Math.round(pos.y)}),
    LMB: 0,
    MMB: 1,
    RMB: 2,
    clickDist:2
}

export default util;