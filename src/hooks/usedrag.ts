import { useState } from "react";
import useScale from './listeners/usescale';
import { Util } from "../util";
import { Point } from "../types/index";
import usePointer from "./listeners/usepointer";
import { useEventListener } from "./listeners";

export default function useDrag (
  doStartDrag: (p: Point, e: React.PointerEvent) => Point[], 
  doOnDrag: ((newPos: Point[], e: PointerEvent, startPos: Point) => void) | null, 
  doEndDrag: (dist: number, e: PointerEvent, endPos: Point[]) => void
):{
  positions: Point[],
  startDrag: (e: React.PointerEvent) => void,
  dragButton: Util.MouseButton
} {
  const [positions, setPositions] = useState<Point[]>([]);
  const [offsets, setOffsets] = useState<Point[]>([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragButton, setDragButton] = useState(0);

  const getScale = useScale();

  function startDrag(e: React.PointerEvent) {
    e.stopPropagation();
    setDragButton(e.button as Util.MouseButton);

    const p = Util.getMousePos(e);
    const startPositions = doStartDrag(p, e);

    setPositions(startPositions);
    const offsets: Point[] = [];
    startPositions.forEach(pos => offsets.push(Util.subPos(pos, p)));
    setOffsets(offsets);
    setStartPos(p);
    markDragStart();
  }

  const onDrag = (e: PointerEvent) => {
    e.stopPropagation();
    const newPositions = offsets.map(offset => getActualPosition(e, offset));

    setPositions(newPositions);
    doOnDrag?.(newPositions, e, startPos);
  };

  function getActualPosition(e: PointerEvent, offset: Point) {
    let scaleOff = Util.mulPos(offset, getScale())
    let newPos = Util.addPos(Util.getMousePos(e), scaleOff);

    // newpos - oldpos to get direction
    let vec = Util.subPos(newPos, startPos);
    // multiply by scale factor
    vec = Util.mulPos(vec, 1 / getScale());

    newPos = Util.addPos(startPos, vec);
    newPos = Util.roundPos(newPos);
    return newPos;
  }

  function endDrag(e: PointerEvent) {
    const endPositions: Point[] = [];
    let i = 0;
    positions.forEach(pos => 
      endPositions.push(getActualPosition(e, offsets[i++])));
    let dist = Util.distance(startPos, Util.getMousePos(e));

    doEndDrag?.(dist, e, endPositions);
    markDragEnd();
  }

  const {markDragStart, markDragEnd} = usePointer(onDrag, endDrag);
  useEventListener('blur', markDragEnd, { stable: true });

  return {
    positions,
    startDrag,
    dragButton
  }
}