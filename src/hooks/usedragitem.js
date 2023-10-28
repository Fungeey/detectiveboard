import { useEffect, useRef, useState } from "react";
import useScale from '../hooks/usescale';
import util from "../util";

export default function useDragItem (doStartDrag, doOnDrag, doEndDrag) {

  // when implementing useDrag, doStartDrag must return start position
  // function defaultDoStartDrag(mousePos, e){
  // return object's start position
  // }

  // doOnDrag and doEndDrag can be empty

  const [positions, setPositions] = useState({ x: 0, y: 0 });
  const [offsets, setOffsets] = useState([{ x: 0, y: 0 }]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragButton, setDragButton] = useState(0);

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

  function startDrag(e) {
    e.stopPropagation();
    setDragButton(e.button);

    let p = util.getMousePos(e);
    let startPositions = doStartDrag(p, e);

    setPositions(startPositions);
    let offsets = [];
    startPositions.forEach(pos => offsets.push(util.subPos(pos, p)));
    setOffsets(offsets);
    setStartPos(p);
  }

  function onDrag(e) {
    let newPositions = [];
    offsets.forEach(offset => newPositions.push(getActualPosition(e, offset)));

    setPositions(newPositions);
    if (doOnDrag) doOnDrag(newPositions, e);
  }

  function getActualPosition(e, offset) {
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

  function endDrag(e) {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);

    let endPositions = [];
    let i = 0;
    positions.forEach(pos => 
      endPositions.push(getActualPosition(e, offsets[i++])));
    let dist = util.distance(startPos, util.getMousePos(e));

    if (doEndDrag)
      doEndDrag(dist, e, endPositions);
  }

  return [
    positions,
    startDrag,
    dragButton      //remove?
  ]
}