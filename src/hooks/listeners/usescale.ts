import { useEffect } from "react";
import util from "../../util";
import useEventListener from "./useeventlistener";

const scaleRef = { current: 1 };
let references = 0;

export function useScale(callback?: (e: WheelEvent) => void){
  useEffect(() => {
    if(references !== 0) return;

    const board = document.getElementById("boardWrapper");
    if(board)
      scaleRef.current = parseInt(board.getAttribute("scale") || '1');
  }, [])

  useEventListener('wheel', (e) => {
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

  }, { stable: true});

  return () => scaleRef.current;
}

export default useScale;