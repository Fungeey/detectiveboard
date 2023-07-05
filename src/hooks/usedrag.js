import { useState, useRef, useLayoutEffect } from "react";

const useDrag = (doStartDrag, doOnDrag, doEndDrag) => {

    // when implementing useDrag, doStartDrag must return start position
    function defaultDoStartDrag(mousePos, e){
        // return object's start position
    }

    // doOnDrag and doEndDrag can be empty

    const[pos, setPos] = useState({x:0, y:0});
    const[offset, setOffset] = useState({x:0, y:0});
    const[startPos, setStartPos] = useState({x:0, y:0});
    const[dragButton, setDragButton] = useState(0);

    // replace with useCallback?
    const firstUpdate = useRef(true);
    useLayoutEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
    }, [offset]);

    function startDrag(e){
        e.stopPropagation();
        setDragButton(e.button);

        let p = getPos(e);
        let newStartPos = doStartDrag(p, e);

        setPos(newStartPos);
        setOffset(subPos(newStartPos, p));
        setStartPos(p);
    }

    function onDrag(e){
        let newPos = addPos(getPos(e), offset);
        setPos(newPos);

        if(doOnDrag) doOnDrag(newPos, e);
    }

    function endDrag(e){
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);

        if(doEndDrag) doEndDrag(distance(startPos, getPos(e)), e);
    }

    return[
        pos,
        startDrag,
        dragButton      //remove?
    ]
}

export default useDrag; 

const distance = (a, b) => Math.sqrt(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) ^ 2);
const getPos = (e) => ({x:e.clientX, y:e.clientY});
const addPos = (a, b) => ({x:a.x+b.x, y:a.y+b.y});
const subPos = (a, b) => ({x:a.x-b.x, y:a.y-b.y});