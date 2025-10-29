import { useState } from "react";
import useScale from './listeners/usescale';
import util, { Util } from "../util";
import { Point } from "../types/index";
import usePointer from "./listeners/usepointer";
import { useEventListener } from "./listeners";

// DEPRICATED

function useDragSingular(
  doStartDrag: (p: Point, e: React.PointerEvent) => Point, 
  doOnDrag?: ((newPos: Point, e: PointerEvent) => void) | null, 
  doEndDrag?: (dist: number, e: PointerEvent, endPos: Point) => void
):{
  pos: Point,
  onMouseDown: (e: React.PointerEvent) => void,
  dragButton: Util.MouseButton
}{
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragButton, setDragButton] = useState(0);

  const getScale = useScale();

  function startDrag(e: React.PointerEvent): void {
    e.stopPropagation();
    setDragButton(e.button as Util.MouseButton);

    const p = util.getMousePos(e);
    const newStartPos = doStartDrag(p, e);

    setPos(newStartPos);
    setOffset(util.subPos(newStartPos, p));
    setStartPos(p);
    markDragStart();
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

  function endDrag(e: PointerEvent) {
    document.removeEventListener('pointermove', onDrag);
    document.removeEventListener('pointerup', endDrag);

    const dist = util.distance(startPos, util.getMousePos(e));
    const endPos = getActualPosition(e);

    doEndDrag?.(dist, e, endPos);
    markDragEnd();
  }

  const {markDragStart, markDragEnd} = usePointer(onDrag, endDrag);
  useEventListener('blur', markDragEnd, { stable: true });

  return {
    pos,
    onMouseDown: startDrag,
    dragButton
  }
}

export default useDragSingular; 