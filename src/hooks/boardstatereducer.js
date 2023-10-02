import { itemReducer, itemActions } from './itemreducer';
import { lineReducer, lineActions } from './linereducer';
import util from '../util';

const mixActions = {
    createLineObj: 'createLineObj',
    deleteLineObj: 'deleteLineObj',
    updateItemObj: 'updateItemObj',
    deleteItemObj: 'deleteItemObj'
}

export const actions = { ...itemActions, ...lineActions, ...mixActions };

export function boardStateReducer(state, action) {
    if (action.type in itemActions)
        return { items: itemReducer(state.items, action), lines: state.lines }

    if (action.type in lineActions)
        return { items: state.items, lines: lineReducer(state.lines, action) }

    switch (action.type) {
        case mixActions.createLineObj: return createLineObject(state, action);
        case mixActions.deleteLineObj: return deleteLineObject(state, action);
        case mixActions.updateItemObj: return updateItemObject(state, action);
        case mixActions.deleteItemObj: return deleteItemObject(state, action);
        default: console.error("undefined reducer action: " + action.type);
    }
}

// line
function createLineObject(state, action) {
    let lines = lineReducer(state.lines, {
        type: lineActions.createLine,
        line: action.line
    });

    let itemRed = itemReducer(state.items, {
        type: itemActions.updateItem,
        uuid: action.line.startRef,
        update: item => item.isConnected = true
    })

    let items = itemReducer(itemRed, {
        type: itemActions.updateItem,
        uuid: action.line.endRef,
        update: item => item.isConnected = true
    })

    return { items: items, lines: lines }
}

function deleteLineObject(state, action) {
    let lines = lineReducer(state.lines, {
        type: lineActions.deleteLine,
        line: action.line
    });

    let newLines = state.lines.filter(l => l.uuid !== action.line.uuid);
    let items = state.items;
    for (const uuid in state.items) {
        let linesConnected =
            newLines.filter(l => l.startRef === uuid || l.endRef === uuid);

        if (linesConnected.length === 0) {
            // modifyItem(uuid, item => item.isConnected = false);

            items = itemReducer(items, {
                type: itemActions.updateItem,
                uuid: uuid,
                update: item => item.isConnected = false
            })
        }
    }

    return { items: items, lines: lines }
}

function updateItemObject(state, action) {
    let items = itemReducer(state.items, {
        type: actions.updateItem,
        uuid: action.uuid,
        update: action.update
    });

    let item = state.items[action.uuid];
    let newPos = util.roundPos(item.pos);

    // doesn't use lineReducer to update
    for (const line of state.lines) {
        if (line.startRef === action.uuid) line.start = newPos;
        else if (line.endRef === action.uuid) line.end = newPos;
    }

    return { items: items, lines: state.lines }
}

function deleteItemObject(state, action) {

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