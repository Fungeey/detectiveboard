import * as itemReducer from './itemreducer';
import * as lineReducer from './linereducer';
import util from '../util';


// every action here must be undoable

export const actions = {
  createItem: 'createItem',
  updateItem: 'updateItem',
  deleteItem: 'deleteItem',

  createLine: 'createLine',
  deleteLine: 'deleteLine',
  load: 'load'
}

export function boardStateReducer(state, action) {
  switch (action.type) {
    case actions.createItem: return createItem(state, action.item);
    case actions.updateItem:
      return updateItem(state, action.uuid, action.update);
    case actions.deleteItem: return deleteItem(state, action.item);

    case actions.createLine: return createLine(state, action.line);
    case actions.deleteLine: return deleteLine(state, action.line);

    case actions.load: return action.data;

    default: console.error("undefined reducer action: " + action.type);
  }
}

function createItem(state, item) {
  let items = itemReducer.createItem(state.items, item);
  return { items: items, lines: state.lines }
}

// line
function createLine(state, line) {
  console.log(line.uuid);
  let lines = lineReducer.createLine(state.lines, line);

  let update = item => item.isConnected = true;
  let items = itemReducer.updateItem(state.items, line.startRef, update);
  items = itemReducer.updateItem(items, line.endRef, update);

  return { items: items, lines: lines }
}

export function getExistingLine(lines, line) {
  for (let i = 0; i < lines.length; i++) {
    let other = lines[i];

    if(
      (other.startRef === line.startRef && other.endRef === line.endRef) || 
      (other.startRef === line.endRef && other.endRef === line.startRef))
      return other;
  }

  return {}
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

function deleteItem(state, item) {
  let items = itemReducer.deleteItem(state.items, item);
  let lines = lineReducer.deleteLinesToItem(state.lines, item.uuid);
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





// update() many times from start to finish
// once finished, create undoable action from start to finish