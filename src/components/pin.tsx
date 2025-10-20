import React from 'react';
import util from "../util";
import { Point } from '../types/index';
const pinSRC = require('../img/pin.png');

export const pin = (pos: Point) => {

  const pinSize = 50;
  const offset = 10;

  function getPos() {
    if (pos) 
      return pos;
    else 
      return { x: 0, y: 0 };
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
}

export default pin;