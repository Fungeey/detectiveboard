import { useEffect, useRef, useState } from "react";
import useScale from '../hooks/usescale';
import util from "../util";
import { Point } from "../types/index";

function useDrag(
  doStartDrag: (p: Point, e: React.MouseEvent) => Point, 
  doOnDrag?: ((newPos: Point, e: MouseEvent) => void) | null, 
  doEndDrag?: (dist: number, e: MouseEvent, endPos: Point) => void
):{
  pos: Point,
  onMouseDown: (e: React.MouseEvent) => void
}{

  // when implementing useDrag, doStartDrag must return start position
  // function defaultDoStartDrag(mousePos, e){
  // return object's start position
  // }

  // doOnDrag and doEndDrag can be empty

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // replace with useCallback?
  const firstUpdate = useRef(true);
  const scale = useScale();

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    window.addEventListener('blur', loseFocus, false);

    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', endDrag);
      window.removeEventListener('blur', loseFocus, false);
    }

  }, [offset]);

  function startDrag(e: React.MouseEvent): void {
    e.stopPropagation();

    const p = util.getMousePos(e);
    const newStartPos = doStartDrag(p, e);

    setPos(newStartPos);
    setOffset(util.subPos(newStartPos, p));
    setStartPos(p);
  }

  function getActualPosition(e: MouseEvent): Point {
    const scaleOff = util.mulPos(offset, scale)
    let newPos = util.addPos(util.getMousePos(e), scaleOff);

    // newpos - oldpos to get direction
    let vec = util.subPos(newPos, startPos);
    // multiply by scale factor
    vec = util.mulPos(vec, 1 / scale);

    newPos = util.addPos(startPos, vec);
    newPos = util.roundPos(newPos);
    return newPos;
  }

  const onDrag = util.throttle((e: MouseEvent) => {
    const newPos = getActualPosition(e);

    setPos(newPos);
    doOnDrag?.(newPos, e);
  }, 10);

  function loseFocus() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  }

  function endDrag(e: MouseEvent) {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);

    const dist = util.distance(startPos, util.getMousePos(e));
    const endPos = getActualPosition(e);

    doEndDrag?.(dist, e, endPos);
  }

  // function onDragT(e){
  //   let newPos = getActualPosition(e);

  //   setPos(newPos);
  //   if (doOnDrag) doOnDrag(newPos, e);
  // }

  return {
    pos,
    onMouseDown: startDrag,
  }
}

export default useDrag; 