import { useState, useRef } from "react";
import useDrag from "./usedrag";
import util from "../util";
import Pin from "../components/pin";
import Line from "../components/line";
import useSelectionBehavior from "./useselectionbehavior";
import useScale from '../hooks/usescale';

let hoverUUID = "";

const useItemBehavior = (props) => {
    const [isSelected, select, deselect, renderSelection] = useSelectionBehavior(props);
    const [previewLine, setPreviewLine] = useState({});
    const [startSize, setStartSize] = useState({});
    const scale = useScale();

    function onStartDrag(mousePos, e){
        setStartSize(getSize());

        const tgt = e.target;
        const inline = tgt.style.cursor || "Not defined"
        const computed = window.getComputedStyle(tgt)["cursor"];

        return pos;
    }

    // initially, isResizing would be set to true right at the beginning
    // that way ondrag and onenddrag would have the correct ones
    // but now isresizing starts as false, but is set to true.

    function onDrag(dragPos, e){
        if(dragButton === util.LMB){
            if(!util.eqlSize(getSize(), startSize)){
                return;
            }

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
            let boardPos = util.subPos(util.getMousePos(e), props.boardPos());
            setPreviewLine({
                start: props.item.pos,
                end: util.mulPos(boardPos, 1/scale)
            });
        }
    }

    function getSize(){
        let itemElement = itemRef.current.childNodes[0].childNodes[0];
        return {
            width: itemElement.clientWidth,
            height: itemElement.clientHeight,
        }
    }

    const onEndDrag = (dist, e) => {
        if(!util.eqlSize(getSize(), startSize)){
            // save new width
            //clientWidth includes padding, so need to subtract it away
            props.update(props.item.uuid, item => item.size = getSize());
        }else if(dragButton === util.LMB){
            // lmb click = select
            if(dist < util.clickDist){
                select();
                return;
            }
            
            // round position 
            props.update(props.item.uuid, item => item.pos = util.roundPos(item.pos))
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

    function render(renderItem, renderItemSelection){ return (<>
        {previewLine.start ? 
            <div className="previewLine blink">
                <Line start={previewLine.start} end={previewLine.end} 
                key={previewLine.uuid}/>
                <Pin pos={previewLine.end}/>

                {!props.item.isConnected ? 
                <Pin pos={previewLine.start}/> : <></>}
            </div>
        :<></>}

        {props.item.isConnected ? <Pin pos={props.item.pos}/> : <></>}   

        <div style = {{...util.posStyle(props.item.pos)}}>
            <div className="itemWrapper" 
                onMouseDown={startDrag}
                onMouseEnter={enter}
                onMouseLeave={exit}
                uuid={props.item.uuid} ref={itemRef}>

                <div className={`itemHolder${isSelected?' selected':''}`}>
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
    </>)}
  
    return [
        render
    ]
}

export default useItemBehavior;
    
