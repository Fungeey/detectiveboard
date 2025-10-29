import * as itemReducer from './itemreducer';
import * as lineReducer from './linereducer';
import util from '../util';
import { State, Item, LineItem } from '../types/index';

export const enum ActionType {
  CREATE_ITEM = 'createItem',
  UPDATE_ITEM = 'updateItem',
  DELETE_ITEM = 'deleteItem',

  CREATE_LINE = 'createLine',
  DELETE_LINE = 'deleteLine',

  MANY = 'many',
  LOAD = 'load',

  UNDO = 'UNDO',
  REDO = 'REDO'
}

export interface Action {
  type: ActionType | ActionType,
  // If type = MANY, this action is a collection of multiple actions.
  actions?: Action[], 

  skipUndo?: boolean,
  restorePresent?: boolean,

  line?: LineItem,
  item?: Item,
  uuid?: string,
  update?: (item: Item) => void,
  data?: State
}

export function boardStateReducer(state: State, action: Action) {
  const newState = runReducer(state, action);

  if(!newState || util.isEmpty(newState)){
    console.error("failed to create new state while performing action");
    return state;
  }

  return newState;
}

function runReducer(state: State, action: Action){
  switch (action.type) {
    case ActionType.CREATE_ITEM: return createItem(state, action.item!);
    case ActionType.UPDATE_ITEM:
      return updateItem(state, action.uuid!, action.update!);
    case ActionType.DELETE_ITEM: return deleteItem(state, action.item!);

    case ActionType.CREATE_LINE: return createLine(state, action.line!);
    case ActionType.DELETE_LINE: return deleteLine(state, action.line!);

    case ActionType.LOAD: return action.data;

    default: console.error("undefined reducer action: " + action);
  }
}

function createItem(state: State, item: Item): State {
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

function updateItem(state: State, uuid: string, update: (item: Item) => void) {
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

function deleteItem(state: State, item: Item) {
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

/*
-- line operations --
1. Create line
    = create line
    = update items: connect
2. Update line
3. Delete line
    = remove line
    = update items: disconnect

-- item operations --
1. Create item
2. Update item
    = update items: color, size, position
    = update line: position
3. Delete item
    = delete item
    = delete line: remove connections
    = update item: disconnect
*/