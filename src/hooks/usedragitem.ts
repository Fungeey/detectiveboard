import { useEffect, useRef, useState } from "react";
import useScale from '../hooks/usescale';
import util from "../util";
import { Point } from "../types/index";

export default function useDragItem (
  doStartDrag: (p: Point, e: React.MouseEvent) => Point[], 
  doOnDrag: ((newPos: Point[], e: MouseEvent) => void) | null, 
  doEndDrag: (dist: number, e: MouseEvent, endPos: Point[]) => void
):{
  positions: Point[],
  startDrag: (e: React.MouseEvent) => void 
} {

  // when implementing useDrag, doStartDrag must return start position
  // function defaultDoStartDrag(mousePos, e){
  // return object's start position
  // }

  // doOnDrag and doEndDrag can be empty

  const [positions, setPositions] = useState<Point[]>([]);
  const [offsets, setOffsets] = useState<Point[]>([]);
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

  }, [offsets]);

  function loseFocus() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  }

  function startDrag(e: React.MouseEvent) {
    e.stopPropagation();

    const p = util.getMousePos(e);
    const startPositions = doStartDrag(p, e);

    setPositions(startPositions);
    const offsets: Point[] = [];
    startPositions.forEach(pos => offsets.push(util.subPos(pos, p)));
    setOffsets(offsets);
    setStartPos(p);
  }

  const onDrag = util.throttle((e: MouseEvent) => {
    const newPositions: Point[] = [];
    offsets.forEach(offset => newPositions.push(getActualPosition(e, offset)));

    setPositions(newPositions);
    doOnDrag?.(newPositions, e);
  }, 1);

  function getActualPosition(e: MouseEvent, offset: Point) {
    let scaleOff = util.mulPos(offset, scale)
    let newPos = util.addPos(util.getMousePos(e), scaleOff);

    // newpos - oldpos to get direction
    let vec = util.subPos(newPos, startPos);
    // multiply by scale factor
    vec = util.mulPos(vec, 1 / scale);

    newPos = util.addPos(startPos, vec);
    newPos = util.roundPos(newPos);
    return newPos;
  }

  function endDrag(e: MouseEvent) {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);

    const endPositions: Point[] = [];
    let i = 0;
    positions.forEach(pos => 
      endPositions.push(getActualPosition(e, offsets[i++])));
    let dist = util.distance(startPos, util.getMousePos(e));

    doEndDrag?.(dist, e, endPositions);
  }

  return {
    positions,
    startDrag,
  }
}