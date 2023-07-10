import { useState, useRef } from "react";
import useDrag from "./usedrag";
import util from "../util";
import Pin from "../components/pin";
import Line from "../components/line";
import useSelectionBehavior from "./useselectionbehavior";

let hoverUUID = "";

const useItemBehavior = (props) => {
    const [isSelected, select, deselect, renderSelection] = useSelectionBehavior(props);
    const [previewLine, setPreviewLine] = useState({});

    const [isResizing, setIsResizing] = useState(false);

    function onStartDrag(mousePos, e){
        let resizePoint = util.addPos(props.item.pos, {
            x: itemRef.current.clientWidth,
            y: itemRef.current.clientHeight,
        });

        let mouseWorldPos = util.subPos(util.getMousePos(e), props.boardPos());

        if(util.distance(mouseWorldPos, resizePoint) < 6){
            setIsResizing(true);
        }

        return pos;
    }

    function onDrag(dragPos, e){
        if(dragButton === util.LMB){
            if(isResizing) return;

            // move the item to the drag position.
            setPos(dragPos);
            props.update(props.item.uuid, item => {item.pos = dragPos});
        }else if(dragButton === util.RMB){
            drawPreviewLine(e);
        }
    }

    function drawPreviewLine(e) {
        if (hoverUUID && props.item.uuid !== hoverUUID) {
            // snap to any item
            setPreviewLine({
                start: props.item.pos,
                end: props.items[hoverUUID].pos
            });
        } else {
            // otherwise go to mouse position
            setPreviewLine({
                start: props.item.pos,
                end: util.subPos(util.getMousePos(e), props.boardPos())
            });
        }
    }

    const onEndDrag = (dist, e) => {
        if(isResizing){
            setIsResizing(false);

            // save new width
            let itemElement = itemRef.current.childNodes[0].childNodes[0];
            props.update(props.item.uuid, item => {item.size={
                width: itemElement.clientWidth,
                height: itemElement.clientHeight,
            }});
        }else if(dragButton === util.LMB && dist < 2){
            // lmb click = select
            select();
        }else if(dragButton === util.RMB){
            // line connecting this item to the hovered (destination) item.
            if(props.item.uuid !== hoverUUID)
                props.makeLine(props.item.uuid, hoverUUID);
        }

        setPreviewLine({});
    }

    const [pos, setPos] = useState(props.item.pos);
    const [dragPos, startDrag, dragButton] = useDrag(onStartDrag, onDrag, onEndDrag);

    function enter(){ hoverUUID = props.item.uuid; }
    function exit(){ hoverUUID = ""; }   

    const itemRef = useRef(null);

    function render(renderItem, renderItemSelection){
        return (
            <>
                {previewLine.start ? 
                    <div className="previewLine">
                        <Line start={previewLine.start} end={previewLine.end} key={previewLine.uuid}/>
                        <Pin pos={previewLine.end}/>
                        {!props.item.isConnected ? <Pin pos={previewLine.start}/> : <></>}
                    </div>
                :<></>}

                {props.item.isConnected ? <Pin pos={props.item.pos}/> : <></>}   

                <div style = {{...util.posStyle(props.item.pos)}}>
                    <div className="itemWrapper" 
                        onMouseDown={startDrag}
                        onMouseEnter={enter}
                        onMouseLeave={exit}
                        uuid={props.item.uuid} ref={itemRef}>

                        <div className="itemHolder">
                            {renderItem(isSelected)}
                        </div>
                    </div>

                    {itemRef.current !== null && props.debug ? 
                    <div style={{
                        position:"absolute",
                        width:20,
                        height:20,
                        top:itemRef.current.clientHeight - 10,
                        left:itemRef.current.clientWidth - 10,
                        background:"blue"
                    }}> </div> : <></>
                    }

                    {isSelected ? renderSelection(itemRef, renderItemSelection) : <></>}
                </div>
            </>
        )
    }
  
    return [
        render
    ]
}

export default useItemBehavior;
    
