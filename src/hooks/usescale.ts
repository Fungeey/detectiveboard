import { useState, useEffect, useCallback } from "react";
import util from "../util";

const useScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const board = document.getElementById("boardWrapper");

    if(board)
      setScale(parseInt(board.getAttribute("scale") || '1'));
  }, [])

  const onWheel = useCallback((e) => {
    const { ctrlKey } = e;
    if (ctrlKey) {
      e.preventDefault();

      // scroll using mousepad pinch zoom
      const spd = 1.1;
      if (e.deltaY < 0)
        setScale(util.round(Math.min(scale * spd, 5), 4));
      else if (e.deltaY > 0)
        setScale(util.round(Math.max(scale * (1 / spd), 0.0625), 4));

      return;
    }

    const spd = 1.25;
    if (e.deltaY < 0)
      setScale(util.round(Math.min(scale * spd, 5), 4));
    else if (e.deltaY > 0)
      setScale(util.round(Math.max(scale * (1 / spd), 0.0625), 4));
  }, [scale]);

  useEffect(() => {

    // element.addEventListener('wheel', event => {
    //   const { ctrlKey } = event
    //   if (ctrlKey) {
    //     event.preventDefault();
    //     return
    //   }
    // }, { passive: false })

    document.addEventListener('wheel', onWheel, { passive: false });
    return () => document.removeEventListener('wheel', onWheel);
  }, [scale, onWheel])

  return scale;
}

export default useScale;