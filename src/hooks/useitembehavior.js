import { useState, useEffect } from "react";
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
        // deselect if click anywhere other than this note.
        if(e.target.parentElement.getAttribute("uuid") !== props.item.uuid){
            deSelect();
        }

        if(e.target.parentElement.getAttribute("uuid") === props.item.uuid && isSelected)
            deSelect();
    }

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

    function getStyle(){
        if(isSelected)
            return {
                ...util.posStyle(props.item.pos),
                outline: "3px solid red"
            }
        else 
            return util.posStyle(props.item.pos);
    }

    function render(renderItem){
        return <div style={getStyle()} className="itemWrapper" 
            onMouseDown={startDrag}
            onMouseEnter={enter}
            onMouseLeave={exit}
            uuid={props.item.uuid}>

            {renderItem()}
            {props.item.isConnected ? <Pin/> : <></>}
            {isSelected ? renderSelection() : <></>}
        </div>
    }

    function deleteItem(){
        props.deleteItem(props.item.uuid);
    }

    function renderSelection(){
        return (
            <img src={require('../img/delete.png')} style={{
                width: 20 + "px",
                height: 20 + "px",
                position:"absolute",
                bottom: -30 + "px"
            }} onClick={deleteItem}/>
        )
    }
  
    return [
        render
    ]
}

export default useItemBehavior;
    
