import { useState } from "react";
import useDrag from "../hooks/usedrag";
import util from "./util";
import Pin from "./pin";

let hoverUUID = "";

const Img = (props) => {
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
            props.makeLine(props.item.uuid, hoverUUID);
        }
    }

    const [pos, setPos] = useState(props.item.pos);
    const [dragPos, startDrag, dragButton] = useDrag(onStartDrag, onDrag, onEndDrag);

    function enter(){ hoverUUID = props.item.uuid; }
    function exit(){ hoverUUID = ""; }

    function getStyle(){
        return {
        ...util.posStyle(props.item.pos)
        // ...util.sizeStyle(200, 200)
        }
    }     

    return (
        <div>
            <img src={props.item.src}
                style={getStyle()}
                className="imgItem"
                draggable={false}
                onMouseDown={startDrag}
                onMouseEnter={enter}
                onMouseLeave={exit}
            />

            {props.item.isConnected ? 
                <Pin pos={props.item.pos}/>
            : <></>}
        </div>
    )
}

export default Img;
    