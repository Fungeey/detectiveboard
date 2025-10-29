import useEventListener from "./useeventlistener";

const mousePosition = { current: { x: 0, y: 0 } };

export function useMousePos() {
  useEventListener('mousemove', (e) => {
    mousePosition.current = { x: e.clientX, y: e.clientY }
  }, { stable: true });

  return () => mousePosition.current;
}

export default useMousePos;