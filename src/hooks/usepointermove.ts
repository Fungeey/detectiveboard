import { useCallback, useEffect, useRef } from "react";

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
) {
  const moveCallbackRef = useRef(pointerMove);
  const upCallbackRef = useRef(pointerMove);

  useEffect(() => {
    moveCallbackRef.current = pointerMove;
    upCallbackRef.current = pointerUp;
  });

  // Use a memoized callback that calls the latest callback
  const stablePointerMove = useCallback((e: PointerEvent) => {
    if (moveCallbackRef.current)
      moveCallbackRef.current(e);
  }, []);

  const stablePointerUp = useCallback((e: PointerEvent) => {
    if (upCallbackRef.current)
      upCallbackRef.current(e);
  }, []);

  function markDragStart(){
    listeners.set(stablePointerMove, stablePointerUp);
  }

  function markDragEnd(){
    listeners.delete(stablePointerMove);
  }

  useEffect(() => {
    listeners.set(stablePointerMove, stablePointerUp);

    if(listeners.size === 1){
      document.addEventListener('pointermove', globalPointerMoveHandler);
      document.addEventListener('pointerup', globalPointerUpHandler);
    }

    return () => {
      listeners.delete(stablePointerMove);

      if(listeners.size === 0){
        document.removeEventListener('pointermove', globalPointerMoveHandler);
        document.removeEventListener('pointerup', globalPointerUpHandler);
      }
    };
  }, [stablePointerMove, stablePointerUp]);

  return {markDragStart, markDragEnd};
}

export default usePointer;