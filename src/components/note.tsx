import React, { useRef } from "react";
import useItemBehavior, { ItemProps } from "../hooks/useItemBehavior";
import util from "../util";
import { ReducerActions } from "../state/boardStateReducer";
import { NoteItem } from "../types/index";

const colors = [
  "#feff9c",      //yellow
  "#FFD09C",       //orange
  "#ff9c9c",      //red
  "#9cccff",      //blue
  "#C4FF9C"      //green
]

const padding = 20; // px;

interface NoteProps extends ItemProps {
  item: NoteItem
}

export const Note: React.FC<NoteProps> = ({
  item,
  debug,
  dispatch,
  getBoardPos,
  data
}) => {
  const {render} = useItemBehavior(item, dispatch, getBoardPos, data);
  const noteRef = useRef<HTMLDivElement | null>(null);

  function doubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if(!noteRef.current) return;

    noteRef.current.contentEditable = 'true';
    noteRef.current.focus();

    dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update: item => item.isFrozen = true });

    document.addEventListener('focusout', unfocus);
    document.addEventListener('keydown', finishEditing);
  }

  function unfocus() {
    stopEditing();
    document.removeEventListener('focusout', unfocus);
    document.removeEventListener('keydown', finishEditing);
  }

  function finishEditing(e: KeyboardEvent) {
    if (e.key !== "Enter" && e.key !== "Escape") return;
    e.preventDefault();

    document.removeEventListener('focusout', unfocus);
    document.removeEventListener('keydown', finishEditing);
    stopEditing();
  }

  function stopEditing() {
    if(!noteRef.current) return;
    noteRef.current.contentEditable = 'false';

    const update = (note: NoteItem) => {
      note.text = noteRef.current?.innerText || ''; 
      note.isFrozen = false 
    }
    dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update:update });
  }

  function getSize() {
    if (item.size)
      return util.sizeStyle({
        width: item.size.width - padding * 2,
        height: item.size.height - padding * 2,
      });
    else
      return util.sizeStyle({ width:150, height:100 });
  }

  function renderItem() {
    return (
      <div 
        className="noteItem" style={{
          ...getSize(),
          background: item.color,
          resize: item.isSelected ? "both" : "none"
        }} 
        onDoubleClick={doubleClick} 
        ref={noteRef}>
        {item.text}
        {debug ? <><br /><br />{item.uuid}</> : <></>}
      </div>
    )
  }

  function changeColor(color: string) {
    const update = (note: NoteItem) => note.color = color;
    dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update: update });
  }

  function renderSelection(itemRef) {
    function colorSelect(color: string) {
      return <div style={{
        width: 20,
        height: 20,
        background: color,
      }} key={color}
        onClick={() => changeColor(color)} />
    }

    return (
      <div className="itemSelection">
        {colors.map(c => colorSelect(c))}
      </div>
    )
  }

  return render(renderItem, renderSelection);
}

export default Note;