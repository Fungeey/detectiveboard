import useEventListener from './useeventlistener';

export function useKeyDown(
  callback: (e: KeyboardEvent) => void, 
  keys: string[]
){
  useEventListener('keydown', (e) => {
    if(e.repeat) return;

    const wasAnyKeyPressed = keys.some((key) => e.key === key);
    if (wasAnyKeyPressed || keys.length === 0) {
      callback(e);
    }
  }, { stable: true});
};

export default useKeyDown;