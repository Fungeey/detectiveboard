import { useState, useEffect } from "react";
import useKeyDown from '../hooks/usekeydown';

let selectUUID = "";

function useSelectionBehavior(props){
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

    function select(){
        selectUUID = props.item.uuid;
        setIsSelected(true);
    }

    function deSelect(){
        selectUUID = "";
        setIsSelected(false);
    }

    useKeyDown(deSelect, ["Enter", "Escape"]);

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

    return[
        isSelected,
        select,
        renderSelection
    ]
}

export default useSelectionBehavior;