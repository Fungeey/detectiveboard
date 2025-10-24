import { useEffect } from "react";

// DEPRECIATED/UNUSED
// merged into usescale.ts

const listeners = new Set<(e: WheelEvent) => void>();

function globalWheelHandler(e: WheelEvent) {
  listeners.forEach((listener) => listener(e));
}

export function useOnScroll(callback: (e: WheelEvent) => void) {
  useEffect(() => {
    listeners.add(callback);

    if(listeners.size === 1){
      document.addEventListener('wheel', globalWheelHandler, { passive: false });
    }

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        document.removeEventListener('wheel', globalWheelHandler);
      }
    };
  }, [callback]);
}

export default useOnScroll;