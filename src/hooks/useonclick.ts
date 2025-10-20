import { useEffect } from "react";

const listeners = new Set<(e: MouseEvent) => void>();

function globalClickHandler(e: MouseEvent) {
  listeners.forEach((listener) => listener(e));
}

export function useOnDocumentClick(callback: (e: MouseEvent) => void) {
  useEffect(() => {
    listeners.add(callback);

    if(listeners.size === 1){
      document.addEventListener('click', globalClickHandler);
    }

    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        document.removeEventListener('click', globalClickHandler);
      }
    };
  }, [callback]);
}

export default useOnDocumentClick;