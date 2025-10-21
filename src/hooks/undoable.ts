import { ReducerActions, boardStateReducer } from "../state/boardstatereducer";
import util from "../util";
import { Action } from "./useundostack";
import { State } from "../types/index";

export interface OmniState {
  past: State[],
  present: State,
  future: State[],
  temporaryPresent: State[]
}

export default function undoable(state: OmniState, action: Action): OmniState {
  if(action.skipUndo){
    if(state.temporaryPresent.length === 0)
      state.temporaryPresent = util.clone(state.present);

    return modifyPresent(state, action);
  }

  switch (action.type) {
    case 'UNDO': return undo(state);
    case 'REDO': return redo(state);
    default: return doReducer(state, action);
  }
}

function undo(state: OmniState): OmniState {
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

function redo(state: OmniState): OmniState {
  const { past, present, future, temporaryPresent } = state;
  if (future.length === 0) return state;

  const next = future[0];
  const newFuture = future.slice(1);

  return {
    past: [...past, present],
    present: next,
    future: newFuture,
    temporaryPresent
  }
}

function doReducer(state: OmniState, action: Action): OmniState {
  let { past, present, future } = state;

  if(action.restorePresent)
    present = util.clone(state.temporaryPresent);

  let newPresent = util.clone(present);
  if(action.type === ReducerActions.MANY && action.actions){
    for(const a of action.actions){
      newPresent = boardStateReducer(newPresent, a);
    }
  }else{
    newPresent = boardStateReducer(util.clone(present), action);
  }

  // const diff = util.objDiff.map(present, newPresent);
  // console.log(diff);

  if (JSON.stringify(present) === JSON.stringify(newPresent))
    return state;

  return {
    past: [...past, present],
    present: newPresent,
    future: [],
    temporaryPresent: []
  }
}

function modifyPresent(state: OmniState, action: Action): OmniState {
  const { past, present, future, temporaryPresent } = state;

  const newPresent = boardStateReducer(util.clone(present), action);

  return {
    past,
    present: newPresent,
    future,
    temporaryPresent
  }
}

// moving an item requires updating the present every frame without counting each update as a new undoable action. First save the present into temporaryPresent. skipUndo bypasses the undo / redo stack to directly modify the present. 

// then once the move is finished, set the present to the temporary present to restore the changes made, and create one undo/redo action to represent the whole move action.