import { useRef, useState } from "react";
import useItemBehavior from "../hooks/useitembehavior";
import util from "../util";
import { actions } from "../state/boardstatereducer";

const colors = [
  "#feff9c",      //yellow
  "#FFD09C",       //orange
  "#ff9c9c",      //red
  "#9cccff",      //blue
  "#C4FF9C"      //green
]

const padding = 20; // px;

const Note = ({ props }) => {
  const [render] = useItemBehavior(props);
  const noteRef = useRef(null);

  function doubleClick(e) {
    e.stopPropagation();
    noteRef.current.contentEditable = true;
    noteRef.current.focus();

    document.addEventListener('focusout', unfocus);
    document.addEventListener('keydown', finishEditing);
  }

  function unfocus(e) {
    stopEditing();
    document.removeEventListener('focusout', unfocus);
  }

  function finishEditing(e) {
    if (e.key !== "Enter" && e.key !== "Escape") return;
    e.preventDefault();

    stopEditing();
    document.removeEventListener('keydown', finishEditing);
  }

  function stopEditing() {
    noteRef.current.contentEditable = false;

    let oldText = props.item.text;
    let newText = noteRef.current.innerText;

    // unfocus and finishEditing may both fire, need to check that the text 
    // hasn't already been updated. Only continue if text is unique
    if (oldText === newText) return;

    props.doAction({
      do: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.text = newText }),
      undo: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.text = oldText })
    });
  }

  function getSize() {
    if (props.item.size)
      return util.sizeStyle({
        width: props.item.size.width - padding * 2,
        height: props.item.size.height - padding * 2,
      });
    else
      return util.sizeStyle(150, 100);
  }

  function renderItem(isSelected) {
    return (
      <div className="noteItem" style={{
        ...getSize(),
        background: props.item.color,
        resize: isSelected ? "both" : "none"
      }} onDoubleClick={doubleClick} ref={noteRef}>
        {props.item.text}
        {props.debug ? <><br /><br />{props.item.uuid}</> : <></>}
      </div>
    )
  }

  function changeColor(color) {
    let oldColor = props.item.color;

    props.doAction({
      do: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.color = color }),
      undo: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.color = oldColor })
    });
  }

  function renderSelection(itemRef) {
    function colorSelect(color) {
      return <div style={{
        width: 20,
        height: 20,
        background: color,
      }} key={color}
        onClick={() => changeColor(color)} />
    }

    return (
      <div className="itemSelection" style={{
        top: itemRef.current.clientHeight,
        left: itemRef.current.clientWidth - 20 * 5 - 5 * 5
      }}>
        {colors.map(c => colorSelect(c))}
      </div>
    )
  }

  return render(renderItem, renderSelection);
}

export default Note;
