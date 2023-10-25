
const mod = 1.25;

export default function BoardBackground({scale, boardPos}){

  let factor = Math.round(Math.log(scale)/ Math.log(1.25));
  console.log(factor);

  factor = Math.pow(1.25, factor % 3);

  return <div id='boardBackground' style={{
    transform: `scale(${1 / scale})`,
    backgroundPosition: `${boardPos.x*scale}px ${boardPos.y*scale}px`,
    backgroundSize: `${factor * 40}px ${factor * 40}px`
  }} />
}