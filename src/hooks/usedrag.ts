import { useEffect, useRef, useState } from "react";
import useScale from '../hooks/usescale';
import util, { Util } from "../util";
import { Point } from "../types/index";

function useDrag(
  doStartDrag: (p: Point, e: React.PointerEvent) => Point, 
  doOnDrag?: ((newPos: Point, e: PointerEvent) => void) | null, 
  doEndDrag?: (dist: number, e: PointerEvent, endPos: Point) => void
):{
  pos: Point,
  onMouseDown: (e: React.PointerEvent) => void,
  dragButton: Util.MouseButton
}{

  // when implementing useDrag, doStartDrag must return start position
  // function defaultDoStartDrag(mousePos, e){
  // return object's start position
  // }

  // doOnDrag and doEndDrag can be empty

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragButton, setDragButton] = useState(0);

  // replace with useCallback?
  const firstUpdate = useRef(true);
  const getScale = useScale();

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    document.addEventListener('pointermove', onDrag);
    document.addEventListener('pointerup', endDrag);
    window.addEventListener('blur', loseFocus, false);

    return () => {
      document.removeEventListener('pointermove', onDrag);
      document.removeEventListener('pointerup', endDrag);
      window.removeEventListener('blur', loseFocus, false);
    }

  }, [offset]);

  function startDrag(e: React.PointerEvent): void {
    e.stopPropagation();
    setDragButton(e.button as Util.MouseButton);

    const p = util.getMousePos(e);
    const newStartPos = doStartDrag(p, e);

    setPos(newStartPos);
    setOffset(util.subPos(newStartPos, p));
    setStartPos(p);
  }

  function getActualPosition(e: PointerEvent): Point {
    const scaleOff = util.mulPos(offset, getScale())
    let newPos = util.addPos(util.getMousePos(e), scaleOff);

    // newpos - oldpos to get direction
    let vec = util.subPos(newPos, startPos);
    // multiply by scale factor
    vec = util.mulPos(vec, 1 / getScale());

    newPos = util.addPos(startPos, vec);
    newPos = util.roundPos(newPos);
    return newPos;
  }

  const onDrag = util.throttle((e: PointerEvent) => {
    const newPos = getActualPosition(e);

    setPos(newPos);
    doOnDrag?.(newPos, e);
  }, 10);

  function loseFocus() {
    document.removeEventListener('pointermove', onDrag);
    document.removeEventListener('pointerup', endDrag);
  }

  function endDrag(e: PointerEvent) {
    document.removeEventListener('pointermove', onDrag);
    document.removeEventListener('pointerup', endDrag);

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
    dragButton
  }
}

export default useDrag; 