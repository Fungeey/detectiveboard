import { useState, useEffect } from "react";

const useUndoStack = () => {
    let [stack, setStack] = useState([]);
    let [undoSpot, setUndoSpot] = useState(0);

    useEffect(() => {
        document.addEventListener('keydown', handleUndoRedo);

        return () => document.removeEventListener('keydown', handleUndoRedo);
    }, [stack, undoSpot]);

    function handleUndoRedo(e) {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undoAction();
        } else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redoAction();
        }
    }

    // action
    // do: {}
    // undo: {}

    function redoAction() {
        //stack.length - undoSpot
        let action = stack[undoSpot];
        if (!action) return;

        // redo the action
        action.do();

        setUndoSpot(undoSpot + 1);
    }

    function undoAction() {
        // pop most recent action from stack
        let action = stack[undoSpot - 1];
        if (!action) return;

        setUndoSpot(undoSpot - 1);

        // undo the action
        action.undo();
    }

    function doAction(action) {
        // clear all redos (replace with this new action)
        let newStack = [];
        for (let i = 0; i < undoSpot; i++) {
            newStack.push(stack[i]);
        }
        newStack.push(action);
        setStack(newStack);

        // execute the given action
        action.do();

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