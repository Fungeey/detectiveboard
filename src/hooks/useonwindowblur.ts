import { useEffect } from "react";

const listeners = new Set<(e: FocusEvent) => void>();

function windowBlurHandler(e: FocusEvent) {
  listeners.forEach((listener) => listener(e));
}

export function useOnWindowBlur(callback: (e: FocusEvent) => void) {
  useEffect(() => {
    listeners.add(callback);

    if(listeners.size === 1){
      window.addEventListener('blur', windowBlurHandler);
    }

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        window.removeEventListener('blur', windowBlurHandler);
      }
    };
  }, [callback]);
}

export default useOnWindowBlur;