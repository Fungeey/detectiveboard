import React, { ReactNode, useEffect, useState } from "react";
import useKeyDown from '../hooks/usekeydown';
import { ReducerActions } from "../state/boardstatereducer";
import { Item } from "../types/index";
import { Action } from "./useundostack";

function useSelectionBehavior(
  item: Item,
  dispatch: React.Dispatch<Action>,
):{
  select: () => void, 
  deSelect: () => void, 
  renderSelection: (
    itemRef: React.Ref<HTMLElement>, 
    renderItemSelection: (itemRef: React.Ref<HTMLElement>) => ReactNode
  ) => ReactNode, 
}{

  useEffect(() => {
    document.addEventListener('click', onClickDocument);
    return () => document.removeEventListener('click', onClickDocument);
  }, []);

  function onClickDocument(e: Event) {
    const target = e.target as HTMLElement;

    if (!target.parentElement) return;
    // deselect if click anywhere other than this note.
    const targetUuid = target.parentElement?.parentElement?.dataset.uuid;

    if (!targetUuid && target.dataset.name !== "deleteButton")
      deSelect();
  }

  const [shiftKey, setShiftKey] = useState<Boolean>(false)

  useKeyDown(() => {
    if(!item.isSelected) return;

    setShiftKey(true);
  }, ["Shift"]);

  function select() {
    dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update: item => item.isSelected = true});
  }

  function deSelect() {
    dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update: item => item.isSelected = false});
  }

  useKeyDown(deSelect, ["Enter", "Escape"]);

  function deleteItem() {
    deSelect();
    dispatch({ type: ReducerActions.DELETE_ITEM, item: item });
  }

  function renderSelection(
    itemRef: React.Ref<HTMLElement>, 
    renderItemSelection: (itemRef: React.Ref<HTMLElement>) => ReactNode
  ): ReactNode {
    return (
      <div className="itemActions">
        <img 
          src={require('../img/delete.png')} 
          alt="delete icon"
          data-name={'deleteButton'}
          style={{
            width: 20,
            height: 20,
          }} onClick={deleteItem} />

        {renderItemSelection?.(itemRef)}
      </div>
    )
  }

  return {
    select,
    deSelect,
    renderSelection
  }
}

export default useSelectionBehavior;