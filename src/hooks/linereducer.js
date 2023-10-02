
export const lineActions = {
    createLine: 'createLine',
    deleteLine: 'deleteLine',
    updateLine: 'updateLine'
}

export function lineReducer(state, action) {
    switch (action.type) {
        case lineActions.createLine: return createLine(state, action);
        case lineActions.deleteLine: return deleteLine(state, action);
        case lineActions.updateLine: return updateLine(state, action);
        case 'delete_lines_to_item': return deleteLinesToItem(state, action);
        default: console.error("undefined reducer action: " + action.type);
    }
}

// line
function createLine(state, action) {
    return [...state, action.line];
}

// uuid
function deleteLine(state, action) {
    return state.filter(l => l.uuid !== action.line.uuid);
}

// make generic, not just position update.
function updateLine(state, action) {
    let newState = [...state];
    newState.forEach(line => action.update(line));
        
    //     {
    //     if (line.startRef === action.uuid) line.start = action.pos;
    //     else if (line.endRef === action.uuid) line.end = action.pos;
    // });

    return newState;
}

function deleteLinesToItem(state, action) {
    return state.filter(
        l => l.startRef !== action.uuid &&
            l.endRef !== action.uuid);
}