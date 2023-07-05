import { useState, useEffect, useRef } from "react";

const useMousePos = () => {
    const [mousePos, setMousePos] = useState({});
    const mouseRefPos = useRef();

    mouseRefPos.current = mousePos;

    useEffect(() => {
        document.addEventListener('mousemove', onMouseMove);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
        }
    }, []);

    function onMouseMove(e){
        setMousePos({x:e.clientX, y:e.clientY});
    }

    return mouseRefPos;
}

export default useMousePos;