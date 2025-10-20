import { useEffect } from "react";
import util from "../util";

const scaleRef = { current: 1 };
const listeners = new Set<(e: WheelEvent) => void>();
let references = 0;

function globalWheelHandler(e: WheelEvent) {
  const { ctrlKey } = e;
  let spd = 1.25;

  // scroll using mousepad pinch zoom
  if (ctrlKey)
    e.preventDefault();

  spd = 1.25;
  if (e.deltaY < 0)
    scaleRef.current = util.round(Math.min(scaleRef.current * spd, 5), 4);
  else if (e.deltaY > 0)
    scaleRef.current = util.round(Math.max(scaleRef.current * (1 / spd), 0.0625), 4);

  listeners.forEach((listener) => listener(e));
}

export function useScale(callback?: (e: WheelEvent) => void){
  useEffect(() => {
    if(references !== 0) return;

    const board = document.getElementById("boardWrapper");
    if(board)
      scaleRef.current = parseInt(board.getAttribute("scale") || '1');
  }, [])

  useEffect(() => {
    references += 1;
    if(callback) listeners.add(callback);

    if(listeners.size === 1 || references === 1){
      document.addEventListener('wheel', globalWheelHandler, { passive: false });
    }

    return () => {
      references -= 1;
      if(callback) listeners.delete(callback);
      if (listeners.size === 0 || references === 0) {
        document.removeEventListener('wheel', globalWheelHandler);
      }
    };
  }, [callback]);

  return () => scaleRef.current;
}

export default useScale;