import * as itemReducer from './ItemReducer';
import * as lineReducer from './LineReducer';
import util from '../util';
import { State, Item, LineItem } from '../types/index';
import { Action } from '../hooks/useUndoStack';

export const enum ReducerActions {
  CREATE_ITEM = 'createItem',
  UPDATE_ITEM = 'updateItem',
  DELETE_ITEM = 'deleteItem',

  CREATE_LINE = 'createLine',
  DELETE_LINE = 'deleteLine',

  MANY = 'many',
  LOAD = 'load'
}

export interface ReducerAction extends Action {

}

export function boardStateReducer(state: State, action: ReducerAction) {
  const newState = runReducer(state, action);

  if(!newState || util.isEmpty(newState)){
    console.error("failed to create new state while performing action");
    return state;
  }

  return newState;
}

function runReducer(state: State, action: ReducerAction){
  switch (action.type) {
    case ReducerActions.CREATE_ITEM: return CREATE_ITEM(state, action.item!);
    case ReducerActions.UPDATE_ITEM:
      return UPDATE_ITEM(state, action.uuid!, action.update!);
    case ReducerActions.DELETE_ITEM: return DELTE_ITEM(state, action.item!);

    case ReducerActions.CREATE_LINE: return createLine(state, action.line!);
    case ReducerActions.DELETE_LINE: return deleteLine(state, action.line!);

    case ReducerActions.LOAD: return action.data;

    default: console.error("undefined reducer action: " + action);
  }
}

function CREATE_ITEM(state: State, item: Item): State {
  const items = itemReducer.createItem(state.items, item);
  return { items: items, lines: state.lines }
}

function createLine(state: State, line: LineItem): State {
  if(!line.startUuid || !line.endUuid) return state;

  const lines = lineReducer.createLine(state.lines, line);

  // mark items on either end of the line as connected
  const update = (item: Item) => item.isConnected = true;
  let items = itemReducer.updateItem(state.items, line.startUuid, update);
  items = itemReducer.updateItem(items, line.endUuid, update);

  return { items: items, lines: lines }
}

export function getExistingLine(
  lines: LineItem[], line: LineItem
): LineItem | null {
  for (let i = 0; i < lines.length; i++) {
    let other = lines[i];

    if (
      (other.startUuid === line.startUuid && other.endUuid === line.endUuid) ||
      (other.startUuid === line.endUuid && other.endUuid === line.startUuid))
      return other;
  }

  return null;
}

function deleteLine(state: State, line: LineItem) {
  const lines = lineReducer.deleteLine(state.lines, line);

  let items = state.items;
  for (const uuid in state.items) {
    const linesConnected =
      lines.filter((l: LineItem) => l.startUuid === uuid || l.endUuid === uuid);

    if (linesConnected.length === 0) {
      items = itemReducer.updateItem(
        items, 
        uuid, 
        (item: Item) => item.isConnected = false);
    }
  }

  return { items: items, lines: lines }
}

function UPDATE_ITEM(state: State, uuid: string, update: (item: Item) => void) {
  const items = itemReducer.updateItem(state.items, uuid, update);
  const item = items[uuid];
  let newPos = util.roundPos(item.pos);

  let lines = state.lines;
  for (const line of state.lines) {
    if (line.startUuid === uuid)
      lines = lineReducer.updateLine(lines, line.uuid,
        line => line.start = newPos);
    else if (line.endUuid === uuid)
      lines = lineReducer.updateLine(lines, line.uuid,
        line => line.end = newPos);
  }

  return { items: items, lines: lines }
}

function DELTE_ITEM(state: State, item: Item) {
  let items = itemReducer.deleteItem(state.items, item);
  const lines = lineReducer.deleteLinesToItem(state.lines, item.uuid);

  let linesRemoved = state.lines.filter(line => !lines.includes(line));
  for (const removedLine of linesRemoved) {
    const otherUUID = (item.uuid === removedLine.startUuid)
      ? removedLine.endUuid
      : removedLine.startUuid;

    const isStillConnected = lines.filter(line => line.startUuid === otherUUID || line.endUuid === otherUUID).length !== 0;

    items = itemReducer.updateItem(
      items, 
      otherUUID!,
      item => item.isConnected = isStillConnected
    );
  }

  return { items: items, lines: lines }
}

// -- basic line operations --
// create line
// delete line
// update line

// -- basic item operations --
// create item
// modify item
// update item
// delete item

// -- joined operations --
// create line
// = create line
// = update items: connect

// delete line
// = remove line
// = update items: disconnect

// update item
// = update items: color, size, position
// = update line: position

// delete item
// = delete item
// = delete line: remove connections
// = update item: disconnect