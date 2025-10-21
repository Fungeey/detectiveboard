import { useState, useEffect, useRef } from "react";
import { Point } from "../types/index";

const useMousePos = () => {
  const [mousePos, setMousePos] = useState<Point | null>(null);
  // const mouseRefPos = useRef();

  // mouseRefPos.current = mousePos;

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, []);

  function onMouseMove(e: MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY });
  }

  return mousePos;
}

export default useMousePos;