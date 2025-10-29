import { useCallback, useEffect, useRef } from "react";
import { Point } from "../types";
import Util from "../util";

const listeners = new Map<
  (e: PointerEvent) => void,
  (e: PointerEvent) => void
>();

let startPosition: Point | undefined;

function globalPointerDownHandler(e: MouseEvent) {
  startPosition = { x: e.clientX, y: e.clientY };
}

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
  pointerMove?: (e: PointerEvent) => void,
  pointerUp?: (e: PointerEvent) => void,
  pointerClick?: (e: PointerEvent) => void
) {
  const moveCallbackRef = useRef(pointerMove);
  const upCallbackRef = useRef(pointerUp);
  const clickCallbackRef = useRef(pointerClick);

  useEffect(() => {
    moveCallbackRef.current = pointerMove;
    upCallbackRef.current = pointerUp;
    clickCallbackRef.current = pointerClick;
  });

  useEffect(() => {
    // if no move callback is provided, manually start the drag
    if(!moveCallbackRef.current){
      markDragStart();
    }
  }, []);

  // Use a memoized callback that calls the latest callback
  const stablePointerMove = useCallback((e: PointerEvent) => {
    if(startPosition === undefined)
      startPosition = { x: e.clientX, y: e.clientY };

    moveCallbackRef.current?.(e);
  }, []);

  const stablePointerClick = useCallback((e: PointerEvent) => {
    clickCallbackRef.current?.(e);
  }, []);

  const stablePointerUp = useCallback((e: PointerEvent) => {
    upCallbackRef.current?.(e);

    const isClick = !startPosition || Util.distance(startPosition, { x: e.clientX, y: e.clientY }) < 3;

    if(isClick){
      stablePointerClick(e);
      return;
    }else{
    }

    startPosition = undefined;
  }, []);

  function markDragStart(){
    listeners.set(stablePointerMove, stablePointerUp);
  }

  function markDragEnd(){
    listeners.delete(stablePointerMove);
  }

  useEffect(() => {
    if(listeners.size === 1){
      // TODO: for some reason pointerdown event doesn't fire. if we could fully use pointer events, the app would support touches on mobile devices
      document.addEventListener('mousedown', globalPointerDownHandler);
      document.addEventListener('pointermove', globalPointerMoveHandler);
      document.addEventListener('pointerup', globalPointerUpHandler);
    }

    return () => {
      listeners.delete(stablePointerMove);

      if(listeners.size === 0){
        document.removeEventListener('mousedown', globalPointerDownHandler);
        document.removeEventListener('pointermove', globalPointerMoveHandler);
        document.removeEventListener('pointerup', globalPointerUpHandler);
      }
    };
  }, [stablePointerMove, stablePointerUp]);

  return {markDragStart, markDragEnd};
}

export default usePointer;