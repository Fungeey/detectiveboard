import { useState} from "react";
import useDrag from "./usedrag";
import util from "./util";

let hoverUUID = "";

const Note = (props) => {
    function onStartDrag(mousePos, e){
        return pos;
    }

    function onDrag(dragPos){
        if(dragButton === util.LMB){
            // move the note to the drag position.
            setPos(dragPos);
            props.update(props.note.uuid, dragPos, dragButton);
        }
    }

    const onEndDrag = (dist, e) => {
        if(dragButton === util.RMB){
            // line connecting this note to the hovered (destination) note.
            props.makeLine(props.note.uuid, hoverUUID);
        }
    }

    const [pos, setPos] = useState(props.note.pos);
    const [dragPos, startDrag, dragButton] = useDrag(onStartDrag, onDrag, onEndDrag);

    function enter(){ hoverUUID = props.note.uuid; }
    function exit(){ hoverUUID = ""; }

    function getStyle(){
        return {
        ...util.posStyle(props.note.pos),
        ...util.sizeStyle(200, 200)
        }
    }     

    return (
        <div className = "note" style={getStyle()}
            onMouseDown={startDrag} 
            onMouseEnter={enter} 
            onMouseLeave={exit}>
            {props.note.text}
        </div>
    )
}

export default Note;