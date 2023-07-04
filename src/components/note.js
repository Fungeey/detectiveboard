import { useState, useCallback, useContext } from "react";
import useDrag from "./usedrag";
import util from "./util";

let hoverUUID = "";

const Note = (props) => {
    // const {hoverUUID, setHoverUUID} = useContext(HoverContext);
    function startDrag(mousePos, e){
        return pos;
    }

    function onDrag(dragPos){
        if(dragButton === 0)    // drag
            setPos(dragPos);
        // if(dragButton === 2) // draw line
        //     props.line.dragLine(dragPos);

        props.update(props.uuid, dragPos, dragButton);
    }

    const endDrag = (dist, e) => {
        if(dragButton === 2)
            props.makeLine(props.uuid, hoverUUID);
            // props.line.endLine(util.subPos({x:e.clientX, y:e.clientY}, props.boardPos()));
    }

    const [pos, setPos] = useState(props.pos);
    const [dragPos, onMouseDown, dragButton] = useDrag(startDrag, onDrag, endDrag);

    const enter = () => {
        hoverUUID = props.uuid; //setHoverUUID(props.uuid);
    }

    const leave = () => {
        hoverUUID = "";
        // setHoverUUID("");
    }

    return (
        <div onMouseEnter={enter} onMouseLeave={leave}>
            {props.render(pos, onMouseDown)}
        </div>
    )

    return (
    <div className = "note" style = {util.posStyle(pos)} onMouseDown={onMouseDown}
        onMouseEnter={() => props.enter(props.uuid)} onMouseLeave={props.exit}>
        {props.text}
    </div>
    )
}

// const useMakeLine = (uuid) => {
//     const [hoverNote, setHoverNote] = useState(""); //hold uuid

//     function onHover(){
//         setHoverNote(uuid);
        

//         // this isn't really a static function though
//         // each useMakeLine hook on each note obj is independent and has its own state.

//         //need a static function so one note can listen to another note object's hover event

//         //1. move state upwards so board handles this
//         //2. singleton ??
//     }
//     return onHover
// }


export default Note;