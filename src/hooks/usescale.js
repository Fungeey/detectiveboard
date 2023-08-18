import { useState, useEffect } from "react";
import util from "../util";

const useScale = () => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        let board = document.getElementById("boardWrapper");
        setScale(board.getAttribute("scale"));
    }, [])

    useEffect(() => {
        document.addEventListener('wheel', onWheel);
        return () => document.removeEventListener('wheel', onWheel);
    }, [scale])

    function onWheel(e) {
        const spd = 1.25;
        if (e.deltaY < 0)
            setScale(util.round(Math.min(scale * spd, 5), 4));
        else if (e.deltaY > 0)
            setScale(util.round(Math.max(scale * (1 / spd), 0.0625), 4));
    }

    return scale;
}

export default useScale;