import { useEffect, useRef } from "react";
import { Point } from "../../types";

const listeners = new Set<(mousePos: Point) => void>();
const mousePosition = { current: { x: 0, y: 0 } };

function globalMouseHandler(e: MouseEvent) {
  mousePosition.current = { x: e.clientX, y: e.clientY }
  listeners.forEach((listener) => listener(e));
}

export function useMousePos(callback: (e: MouseEvent) => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function stableCallback(event: MouseEvent) {
      callbackRef.current(event);
    }

    listeners.add(stableCallback);

    if(listeners.size === 1){
      document.addEventListener('mousemove', globalMouseHandler);
    }

    return () => {
      listeners.delete(stableCallback);
      if (listeners.size === 0) {
        document.removeEventListener('mousemove', globalMouseHandler);
      }
    };
  }, [callback]);

  // Return a function to read the current mouse position without triggering rerender
  return () => mousePosition.current;
}

export default useMousePos;