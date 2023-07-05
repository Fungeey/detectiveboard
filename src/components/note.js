import { useState } from "react";
import useDrag from "../hooks/usedrag";
import util from "./util";
import Pin from "./pin";

let hoverUUID = "";

const Note = (props) => {
    function onStartDrag(mousePos, e){
        return pos;
    }

    function onDrag(dragPos){
        if(dragButton === util.LMB){
            // move the item to the drag position.
            setPos(dragPos);
            props.update(props.item.uuid, dragPos, dragButton);
        }
    }

    const onEndDrag = (dist, e) => {
        if(dragButton === util.RMB){
            // line connecting this item to the hovered (destination) item.
            if(props.item.uuid !== hoverUUID)
                props.makeLine(props.item.uuid, hoverUUID);
        }
    }

    const [pos, setPos] = useState(props.item.pos);
    const [dragPos, startDrag, dragButton] = useDrag(onStartDrag, onDrag, onEndDrag);

    function enter(){ hoverUUID = props.item.uuid; }
    function exit(){ hoverUUID = ""; }   

    return (
        <div style={util.posStyle(props.item.pos)} className="itemWrapper">
            <div className = "noteItem" style={util.sizeStyle(200, 130)}
            onMouseDown={startDrag} 
            onMouseEnter={enter} 
            onMouseLeave={exit}>
            {props.item.text}
            </div>

            {props.item.isConnected ? 
                <Pin/>
            : <></>}
        </div>
    )
}

export default Note;
    