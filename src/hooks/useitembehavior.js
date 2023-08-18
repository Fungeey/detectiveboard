import { useState, useRef, useEffect } from "react";
import useDrag from "./usedrag";
import util from "../util";
import Pin from "../components/pin";
import Line from "../components/line";
import useSelectionBehavior from "./useselectionbehavior";
import useScale from '../hooks/usescale';
import useCopyPaste from '../hooks/usecopypaste';
import useMousePos from '../hooks/usemousepos';

let hoverUUID = "";

const useItemBehavior = (props) => {
    const [isSelected, select, deselect, renderSelection] = useSelectionBehavior(props);
    const [previewLine, setPreviewLine] = useState({});
    const [startSize, setStartSize] = useState({});
    const scale = useScale();
    const mousePos = useMousePos();

    const [copiedItem, setCopiedItem] = useState(null);

    // shouldn't be able to copy when editing
    function copy(){
        if(!isSelected){
            setCopiedItem(null); // throw away previously copied item
            return;
        }
        setCopiedItem(props.item);
    }

    function paste(){
        if(copiedItem == null) return;
        
        let itemCopy = {...copiedItem};
        let boardPos = util.subPos(mousePos.current, props.boardPos());
        itemCopy.pos = util.mulPos(boardPos, 1/scale);

        props.addItem(itemCopy);
    }
    
    useCopyPaste(copy, paste);

    function onStartDrag(mousePos, e){
        setStartSize(getSize());
        return pos;
    }

    function onDrag(dragPos, e){
        if(dragButton === util.LMB){
            if(!util.eqlSize(getSize(), startSize)){
                // resizing, don't change position
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

    // cancel preview line on window unfocus
    useEffect(() => {
        window.addEventListener('blur', () => setPreviewLine({}), false);
        return () => 
            window.removeEventListener('blur', () => setPreviewLine({}), false);
    }, []);

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
    
