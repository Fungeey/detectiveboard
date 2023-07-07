import { useState, useRef } from "react";
import useDrag from "./usedrag";
import util from "../util";
import Pin from "../components/pin";
import useSelectionBehavior from "./useselectionbehavior";

let hoverUUID = "";

const useItemBehavior = (props) => {
    const [isSelected, select, renderSelection] = useSelectionBehavior(props);

    function onStartDrag(mousePos, e){
        return pos;
    }

    function onDrag(dragPos){
        if(dragButton === util.LMB){
            // move the item to the drag position.
            setPos(dragPos);
            props.update(props.item.uuid, item => {item.pos = dragPos});
        }
    }

    const onEndDrag = (dist, e) => {
        if(dragButton === util.LMB && dist < 2){
            select();
        }else if(dragButton === util.RMB){
            // line connecting this item to the hovered (destination) item.
            if(props.item.uuid !== hoverUUID)
                props.makeLine(props.item.uuid, hoverUUID);
        }
    }

    const [pos, setPos] = useState(props.item.pos);
    const [dragPos, startDrag, dragButton] = useDrag(onStartDrag, onDrag, onEndDrag);

    function enter(){ hoverUUID = props.item.uuid; }
    function exit(){ hoverUUID = ""; }   

    const itemRef = useRef(null);

    function render(renderItem, renderItemSelection){
        return (
            <div style = {util.posStyle(props.item.pos)}>
                <div className="itemWrapper" 
                    onMouseDown={startDrag}
                    onMouseEnter={enter}
                    onMouseLeave={exit}
                    uuid={props.item.uuid} ref={itemRef}>

                    <div className="itemHolder">
                    {renderItem()}
                    </div>
                    {props.item.isConnected ? <Pin/> : <></>}           
                </div>

                {isSelected ? renderSelection(itemRef, renderItemSelection) : <></>}
            </div>
        )
    }
  
    return [
        render
    ]
}

export default useItemBehavior;
    
