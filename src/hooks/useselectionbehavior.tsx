import React, { ReactNode, useCallback, useState } from "react";
import useKeyDown from './useKeyDown';
import { ReducerActions } from "../state/boardStateReducer";
import { Item } from "../types/index";
import { Action } from "./useUndoStack";
import useOnDocumentClick from "./useOnClick";

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

  const select = useCallback(() => {
    dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update: item => item.isSelected = true});
  }, [dispatch, item.uuid]);

  const deSelect = useCallback(() => {
    dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update: item => item.isSelected = false});
  }, [dispatch, item.uuid]);

  const onClickDocument = useCallback((e: Event) => {
    const target = e.target as HTMLElement;

    if (!target.parentElement) return;
    // deselect if click anywhere other than this note.
    const targetUuid = target.parentElement?.parentElement?.dataset.uuid;

    if (!targetUuid && target.dataset.name !== "deleteButton")
      deSelect();
  }, [deSelect]);

  useOnDocumentClick(onClickDocument);

  const [shiftKey, setShiftKey] = useState<Boolean>(false)

  useKeyDown(() => {
    if(!item.isSelected) return;

    setShiftKey(true);
  }, ["Shift"]);

  console.log(shiftKey)

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