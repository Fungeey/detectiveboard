import React from 'react';

const mod = 1.25;

export default function BoardBackground({ scale, boardPos }) {

  function getFactor() {
    let factor = Math.round(Math.log(scale) / Math.log(1.25));
    factor = Math.pow(1.25, factor % 3);
    return factor;
  }

  return <div id='boardBackground' style={{
    transform: `scale(${1 / scale})`,
    backgroundPosition: `${boardPos.x * scale}px ${boardPos.y * scale}px`,
    backgroundSize: `${getFactor() * 40}px ${getFactor() * 40}px`,
    background: 'radial-gradient(circle at center, #3a2a22 0, #140c0a 70%)',
  }} />
}