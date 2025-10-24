import { useState, useEffect, useCallback } from "react";
import { Action } from "../state/boardstatereducer";

//
// This hook is depreciated - the real logic is in undoable.ts 
// and boardstatereducer.ts
//
const useUndoStack = () => {
  const [stack, setStack] = useState<Action[]>([]);
  const [undoSpot, setUndoSpot] = useState(0);

  const redoAction = useCallback(() => {
    //stack.length - undoSpot
    const action = stack[undoSpot];
    if (!action) return;

    // redo the action
    // action.do();

    setUndoSpot(undoSpot + 1);
  }, [stack, undoSpot]);

  const undoAction = useCallback(() => {
    // pop most recent action from stack
    let action = stack[undoSpot - 1];
    if (!action) return;

    setUndoSpot(undoSpot - 1);

    // undo the action
    // action.undo();
  }, [stack, undoSpot]);

  const handleUndoRedo = useCallback((e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undoAction();
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redoAction();
    }
  }, [undoAction, redoAction]);

  useEffect(() => {
    document.addEventListener('keydown', handleUndoRedo);
    return () => document.removeEventListener('keydown', handleUndoRedo);
  }, [handleUndoRedo]);

  function doAction(action: Action) {
    // clear all redos (replace with this new action)
    const newStack: Action[] = [];
    for (let i = 0; i < undoSpot; i++) {
      newStack.push(stack[i]);
    }

    newStack.push(action);
    setStack(newStack);

    // execute the given action
    // action.do();

    // add it to the undo stack
    setUndoSpot(newStack.length);
  }

  // create item                      inside board
  // delete item                      from item
  // create / delete lines            inside board
  // move item                        from item
  // resize item                      from item
  // recolor note                     from item

  // have to pass in a method to edit the item.
  // 

  return doAction;
}

export default useUndoStack;