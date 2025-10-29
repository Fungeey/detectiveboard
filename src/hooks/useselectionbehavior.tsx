import React, { useCallback, useState } from "react";
import useKeyDown from './usekeydown';
import { Action, ActionType } from "../state/boardstatereducer";
import { State } from "../types/index";
import usePointer from "./usepointermove";

function useSelectionBehavior(
  state: State,
  dispatch: React.Dispatch<Action>,
){
  const selectAny = useCallback((uuid: string) => {
    dispatch({ type: ActionType.UPDATE_ITEM, uuid, update: item => item.isSelected = true });
  }, [dispatch]);

  const deSelectAll = useCallback(() => {
    Object.values(state.items).forEach((item) => {
      if(item.isSelected){
        dispatch({ type: ActionType.UPDATE_ITEM, uuid: item.uuid, update: item => item.isSelected = false});
      }
    });
  }, [dispatch, state]);

  const onClickDocument = useCallback((e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (!target.parentElement) return;

    // deselect if click anywhere other than this note.
    const targetUuid = target.parentElement?.parentElement?.dataset.uuid;

    if (!targetUuid && target.dataset.name !== "deleteButton")
      deSelectAll();
    else if (targetUuid)
      selectAny(targetUuid);

  }, [deSelectAll]);

  usePointer(undefined, undefined, onClickDocument);

  const [shiftKey, setShiftKey] = useState<Boolean>(false)

  useKeyDown(() => {
    setShiftKey(true);
  }, ["Shift"]);
}

export default useSelectionBehavior;