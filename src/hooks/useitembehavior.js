import { useState, useRef } from "react";
import useDrag from "./usedrag";
import util from "../util";
import Pin from "../components/pin";
import useSelectionBehavior from "./useselectionbehavior";

let hoverUUID = "";

const useItemBehavior = (props) => {
    const [isSelected, select, renderSelection] = useSelectionBehavior(props);
    const [isMakingLine, setIsMakingLine] = useState(false);
    const [line, setLine] = useState({});

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
            // // is dragging
            // if(hoverUUID){
            //     console.log("asdf");
            //     setIsMakingLine(true);
            //     setLine({
            //         start:props.item.pos,
            //         end:{x:0, y:0}
            //     })
            // }
        }
    }

    const onEndDrag = (dist, e) => {
        if(isResizing){
            setIsResizing(false);

            let itemElement = itemRef.current.childNodes[0].childNodes[0];
            props.update(props.item.uuid, item => {item.size={
                width: itemElement.width,
                height: itemElement.height,
            }});
        }else if(dragButton === util.LMB && dist < 2){
            select();
        }else if(dragButton === util.RMB){
            // line connecting this item to the hovered (destination) item.
            if(props.item.uuid !== hoverUUID)
                props.makeLine(props.item.uuid, hoverUUID);
        }

        setIsMakingLine(false);
        setLine({});
    }

    const [pos, setPos] = useState(props.item.pos);
    const [dragPos, startDrag, dragButton] = useDrag(onStartDrag, onDrag, onEndDrag);

    function enter(){ hoverUUID = props.item.uuid; }
    function exit(){ hoverUUID = ""; }   

    const itemRef = useRef(null);

    function render(renderItem, renderItemSelection){
        return (
            <>
                {/* {isMakingLine ? <Line start={line.start} end={line.end} key={line.uuid}/> : <></>} */}
                <div style = {util.posStyle(props.item.pos)}>
                    <div className="itemWrapper" 
                        onMouseDown={startDrag}
                        onMouseEnter={enter}
                        onMouseLeave={exit}
                        uuid={props.item.uuid} ref={itemRef}>

                        <div className="itemHolder">
                            {renderItem(isSelected)}
                        </div>
                        {props.item.isConnected ? <Pin/> : <></>}           
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
    
