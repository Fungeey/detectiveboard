import React from 'react';
import util from '../util'
import { Point } from '../types/index';

interface LineProps{
  key: string,
  start: Point,
  end: Point
}

const offset = { x: 10, y: 10 };
const buffer = 5; // how much extra space to pad the svg area by
const lineWidth = 5;
const tension = 1;

export const Line: React.FC<LineProps> = ({
  key, start:_start, end:_end
}) => {

  const start = util.addPos(_start, offset);
  const end = util.addPos(_end, offset);

  const topLeft = () => ({
    x: Math.min(start.x, end.x) - buffer,
    y: Math.min(start.y, end.y) - buffer
  });

  function getSvgWidth() {
    let width = Math.max(start.x, end.x) - Math.min(start.x, end.x);
    return Math.round(width + buffer * 2);
  }

  function getSvgHeight() {
    let height = Math.max(start.y, end.y) - Math.min(start.y, end.y);
    return Math.round(height + buffer * 2);
  }

  const lineStyle = () => ({
    stroke: "red",
    strokeWidth: lineWidth,
    fill: "transparent"
  });

  const x1 = start.x - topLeft().x;
  const y1 = start.y - topLeft().y;
  const x2 = end.x - topLeft().x;
  const y2 = end.y - topLeft().y;

  const m1 = Math.abs((x1 - x2) / 2);
  const m2 = Math.max(y1, y2) * tension;

  return (
    <svg className='svgHolder' key={key} width={getSvgWidth()} height={getSvgHeight()}
      style={util.posStyle(topLeft())}>
      <path d={`M ${x1} ${y1} Q ${m1} ${m2} ${x2} ${y2}`}
        style={lineStyle()} />
    </svg>
  )
}

export default Line;