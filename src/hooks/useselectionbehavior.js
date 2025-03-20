import { useEffect, useState } from "react";
import useKeyDown from '../hooks/usekeydown';
import { reducerActions } from "../state/boardstatereducer";

function useSelectionBehavior(props) {
  useEffect(() => {
    document.addEventListener('click', onClickDocument);
    return () => document.removeEventListener('click', onClickDocument);
  }, []);

  function onClickDocument(e) {
    if (!e.target.parentElement) return;
    // deselect if click anywhere other than this note.
    let target = e.target.parentElement.parentElement.getAttribute("uuid");

    if (target === null && e.target.name !== "deleteButton")
      deSelect();
  }

  const [shiftKey, setShiftKey] = useState()

  useKeyDown(() => {
    if(!props.item.isSelected) return;

    setShiftKey(true);
  }, ["Shift"]);

  function select() {
    props.dispatch({ type: reducerActions.updateItem, uuid: props.item.uuid, update: item => item.isSelected = true});
  }

  function deSelect() {
        props.dispatch({ type: reducerActions.updateItem, uuid: props.item.uuid, update: item => item.isSelected = false});
  }

  useKeyDown(deSelect, ["Enter", "Escape"]);

  function deleteItem() {
    deSelect();
    props.dispatch({ type: reducerActions.deleteItem, item: props.item });
  }

  function renderSelection(itemRef, renderItemSelection) {
    return <div className="itemActions">
      <img src={require('../img/delete.png')} alt="delete icon" name="deleteButton"
        style={{
          width: 20,
          height: 20,
        }} onClick={deleteItem} />

      {renderItemSelection ? renderItemSelection(itemRef) : <></>}
    </div>
  }

  return [
    select,
    deSelect,
    renderSelection
  ]
}

export default useSelectionBehavior;