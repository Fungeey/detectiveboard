import { useCallback, useEffect, useRef, useState } from "react";
import { Point } from "../types";
import Util from "../util";

const listeners = new Map<
  (e: PointerEvent) => void,
  (e: PointerEvent) => void
>();

function globalPointerMoveHandler(e: PointerEvent) {
  listeners.forEach((upListener, moveListener) => {
    moveListener(e);
  });
}

function globalPointerUpHandler(e: PointerEvent) {
  listeners.forEach((upListener, moveListener) => {
    upListener(e);
  });
}

// are there any situations we use pointer but not for drag?
export function usePointer(
  pointerMove: (e: PointerEvent) => void,
  pointerUp: (e: PointerEvent) => void,
  pointerClick?: (e: PointerEvent) => void
) {
  const moveCallbackRef = useRef(pointerMove);
  const upCallbackRef = useRef(pointerUp);
  const clickCallbackRef = useRef(pointerClick);
  const [startPosition, setStartPosition] = useState<Point>();

  useEffect(() => {
    moveCallbackRef.current = pointerMove;
    upCallbackRef.current = pointerUp;
    clickCallbackRef.current = pointerClick;
  });

  // Use a memoized callback that calls the latest callback
  const stablePointerMove = useCallback((e: PointerEvent) => {
    if(startPosition === undefined)
      setStartPosition({ x: e.clientX, y: e.clientY });

    moveCallbackRef.current?.(e);
  }, []);

  const stablePointerUp = useCallback((e: PointerEvent) => {
    upCallbackRef.current?.(e);

    // calculate distance
    if(!startPosition) return;

    const dist = Util.distance(startPosition, { x: e.clientX, y: e.clientY });
    console.log(dist);

    if(dist < 2)
      stablePointerClick(e);
  }, []);

  const stablePointerClick = useCallback((e: PointerEvent) => {
    clickCallbackRef.current?.(e);
  }, []);

  function markDragStart(){
    listeners.set(stablePointerMove, stablePointerUp);
  }

  function markDragEnd(){
    listeners.delete(stablePointerMove);
  }

  useEffect(() => {
    if(listeners.size === 1){
      document.addEventListener('pointermove', globalPointerMoveHandler);
      document.addEventListener('pointerup', globalPointerUpHandler);
    }

    return () => {
      listeners.delete(stablePointerMove);

      if(listeners.size === 0){
        console.log('cleanup');
        document.removeEventListener('pointermove', globalPointerMoveHandler);
        document.removeEventListener('pointerup', globalPointerUpHandler);
      }
    };
  }, [stablePointerMove, stablePointerUp]);

  return {markDragStart, markDragEnd};
}

export default usePointer;