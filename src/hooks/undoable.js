import { boardStateReducer } from "../state/boardstatereducer";
import util from "../util";

export default function undoable(state, action) {
  if(action.skipUndo){
    if(state.temporaryPresent.length == 0)
      state.temporaryPresent = util.clone(state.present);

    return modifyPresent(state, action);
  }

  switch (action.type) {
    case 'UNDO': return undo(state);
    case 'REDO': return redo(state);
    default: return doReducer(state, action);
  }
}

function undo(state) {
  const { past, present, future, temporaryPresent } = state;
  if (past.length === 0) return state;

  const previous = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);
  
  return {
    past: newPast,
    present: previous,
    future: [present, ...future],
    temporaryPresent: temporaryPresent
  }
}

function redo(state) {
  const { past, present, future, temporaryPresent } = state;
  if (future.length === 0) return state;

  const next = future[0]
  const newFuture = future.slice(1)
  return {
    past: [...past, present],
    present: next,
    future: newFuture,
    temporaryPresent: temporaryPresent
  }
}

function doReducer(state, action) {
  let { past, present, future } = state;

  if(action.restorePresent){
    present = util.clone(state.temporaryPresent);
  }

  const newPresent = boardStateReducer(util.clone(present), action);
  if (present === newPresent)
    return state;

  return {
    past: [...past, present],
    present: newPresent,
    future: [],
    temporaryPresent: []
  }
}

function modifyPresent(state, action){
  const { past, present, future, temporaryPresent } = state;

  const newPresent = boardStateReducer(util.clone(present), action);

  return {
    past: past,
    present: newPresent,
    future: future,
    temporaryPresent: temporaryPresent
  }
}