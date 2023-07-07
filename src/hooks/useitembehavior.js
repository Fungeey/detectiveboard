import { useState, useEffect, useRef } from "react";
import useDrag from "./usedrag";
import useMouseEvents from "./usemouseevents";
import useKeyDown from '../hooks/usekeydown';
import util from "../util";
import Pin from "../components/pin";

let hoverUUID = "";
let selectUUID = "";

const useItemBehavior = (props) => {
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        document.addEventListener('click', onClickDocument);
        return () => document.removeEventListener('click', onClickDocument);
    }, []);

    function onClickDocument(e){
        // if(!e.target.parentElement) return;
        // deselect if click anywhere other than this note.
        if(e.target.parentElement.parentElement.getAttribute("uuid") !== props.item.uuid){
            deSelect();
        }

        // deselect if you click it again and it's already selected
    }

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

    function select(){
        selectUUID = props.item.uuid;
        setIsSelected(true);
    }

    function deSelect(){
        selectUUID = "";
        setIsSelected(false);
    }

    useKeyDown(deSelect, ["Enter", "Escape"]);

    const itemRef = useRef(null);

    function getStyle(){
        if(isSelected && props.debug)
            return {
                outline: "2px solid red"
            }
        else 
            return {};
    }

    function render(renderItem, renderItemSelection){
        return (
            <div style = {util.posStyle(props.item.pos)}>
                <div className="itemWrapper" 
                    onMouseDown={startDrag}
                    onMouseEnter={enter}
                    onMouseLeave={exit}
                    uuid={props.item.uuid} ref={itemRef} style={getStyle()}>

                    <div className="itemHolder">
                    {renderItem()}
                    </div>
                    {props.item.isConnected ? <Pin/> : <></>}           
                </div>

                {isSelected ? renderSelection(itemRef, renderItemSelection) : <></>}
            </div>
        )
    }

    function deleteItem(){
        props.deleteItem(props.item.uuid);
    }

    function renderSelection(itemRef, renderItemSelection){
        return (
            <div>
                <img src={require('../img/delete.png')} style={{
                    width: 20,
                    height: 20,
                    top:itemRef.current.clientHeight + 5,
                    left:itemRef.current.clientWidth - 20,
                    position:"absolute"
                }} onClick={deleteItem}/>

                {renderItemSelection ? renderItemSelection(itemRef) : <></>} 
            </div>
        )
    }
  
    return [
        render
    ]
}

export default useItemBehavior;
    
