import { boardStateReducer } from "../state/boardstatereducer";
import util from "../util";

export default function undoable(state, action) {
  switch (action.type) {
    case 'UNDO': return undo(state);
    case 'REDO': return redo(state);
    default: return doReducer(state, action);
  }
}

function undo(state) {
  const { past, present, future } = state;
  if (past.length === 0) return state;

  const previous = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);
  return {
    past: newPast,
    present: previous,
    future: [present, ...future]
  }
}

function redo(state) {
  const { past, present, future } = state;
  if (future.length === 0) return state;

  const next = future[0]
  const newFuture = future.slice(1)
  return {
    past: [...past, present],
    present: next,
    future: newFuture
  }
}

function doReducer(state, action) {
  const { past, present, future } = state;

  const newPresent = boardStateReducer(util.clone(present), action);
  if (present === newPresent)
    return state;

  let diff = util.objDiff.map(present, newPresent);
  // util.logObj(diff);

  return {
    past: [...past, present],
    present: newPresent,
    future: []
  }
}