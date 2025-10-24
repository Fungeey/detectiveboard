import React from 'react';
import util from "../util";
import { Point } from '../types/index';
const pinSRC = require('../img/pin.png');

const pinSize = 50;
const offset = 10;

interface PinProps{
  pos: Point
}

export const Pin: React.FC<PinProps> = React.memo(({pos}) => {

  function getPos(): Point {
    return pos || { x: 0, y:0 };
  }

  return (
    <img className="pin" alt="thumbtack" src={pinSRC}
      style={{
        ...util.posStyle(getPos()),
        width: pinSize, height: pinSize,
        left: -pinSize / 2 + offset,
        top: -pinSize / 2 + offset
      }} />
  )
});

export default Pin;