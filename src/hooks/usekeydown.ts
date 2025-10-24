import { useCallback, useEffect, useRef } from 'react';

const listeners = new Map<(e: KeyboardEvent) => void, string[]>();

function globalKeyHandler(e: KeyboardEvent) {
  if(e.repeat) return;

  listeners.forEach((keys, callback) => {
    const wasAnyKeyPressed = keys.some((key) => e.key === key);
    if (wasAnyKeyPressed || keys.length === 0) {
      console.log("ACTUAL")
      // e.preventDefault();
      callback(e);
    }
  });
}

export function useKeyDown(
  callback: (e: KeyboardEvent) => void, 
  keys: string[]
){
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback
  });

  // Use a memoized callback that calls the latest callback
  const stableCallback = useCallback((e: KeyboardEvent) => {
    if (callbackRef.current) {
      callbackRef.current(e);
    }
  }, []);

  useEffect(() => {
    listeners.set(stableCallback, keys);
    console.log(listeners.size)

    if(listeners.size === 1){
      console.log('setup')
      document.addEventListener('keydown', globalKeyHandler);
    }

    return () => {
      listeners.delete(stableCallback);
      if (listeners.size === 0) {
        document.removeEventListener('keydown', globalKeyHandler);
      }
    };
  }, [stableCallback]);
};

export default useKeyDown;