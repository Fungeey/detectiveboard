import * as itemReducer from './itemreducer';
import * as lineReducer from './linereducer';
import util from '../util';

export const actions = {
  createItem: 'createItem',
  updateItem: 'updateItem',
  deleteItem: 'deleteItem',

  createLine: 'createLine',
  deleteLine: 'deleteLine'
}

export function boardStateReducer(state, action) {
  switch (action.type) {
    case actions.createItem: return createItem(state, action.item);
    case actions.updateItem: return updateItem(state, action.uuid, action.update);
    case actions.deleteItem: return deleteItem(state, action.uuid);

    case actions.createLine: return createLine(state, action.line);
    case actions.deleteLine: return deleteLine(state, action.line);

    default: console.error("undefined reducer action: " + action.type);
  }
}

function createItem(state, item) {
  item.uuid = util.getUUID(item.type);

  let items = itemReducer.createItem(state.items, item);
  return { items: items, lines: state.lines }
}

// line
function createLine(state, line) {
  let lines = lineReducer.createLine(state.lines, line);

  let items = itemReducer.updateItem(state.items, line.startRef,
    item => item.isConnected = true);
  items = itemReducer.updateItem(items, line.endRef,
    item => item.isConnected = true);

  return { items: items, lines: lines }
}

function deleteLine(state, line) {
  let lines = lineReducer.deleteLine(state.lines, line);

  let items = state.items;
  for (const uuid in state.items) {
    let linesConnected =
      lines.filter(l => l.startRef === uuid || l.endRef === uuid);

    if (linesConnected.length === 0) {
      items = itemReducer.updateItem(items, uuid, item => item.isConnected = false);
    }
  }

  return { items: items, lines: lines }
}

function updateItem(state, uuid, update) {
  let items = itemReducer.updateItem(state.items, uuid, update);
  let item = items[uuid];
  let newPos = util.roundPos(item.pos);

  let lines = state.lines;
  for (const line of state.lines) {
    if (line.startRef === uuid)
      lines = lineReducer.updateLine(lines, line.uuid,
        line => line.start = newPos);
    else if (line.endRef === uuid)
      lines = lineReducer.updateLine(lines, line.uuid,
        line => line.end = newPos);
  }

  return { items: items, lines: lines }
}

function deleteItem(state, uuid) {
  let items = itemReducer.deleteItem(state.items, uuid);
  let lines = lineReducer.deleteLinesToItem(state.lines, uuid);
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