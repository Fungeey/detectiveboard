

export default function boardLineReducer(state, action){
    switch (action.type){
        case 'create_line': return createLine(state, action);
        case 'delete_line': return deleteLine(state, action);
        case 'update_line': return updateLine(state, action);
        case 'delete_lines_to_item': return deleteLinesToItem(state, action);
        default: console.error("undefined reducer action: " + action.type);
    }
}

function createLine(state, action){
    return [...state, action.line];
}

function deleteLine(state, action){
    return state.filter(l => l.uuid !== action.line.uuid);
}

function updateLine(state, action){
    let newState = [...state];
    newState.forEach(line => {
        if (line.startRef === action.uuid) line.start = action.pos;
        else if (line.endRef === action.uuid) line.end = action.pos;
    });

    return newState;
}

function deleteLinesToItem(state, action){
    return state.filter(
        l => l.startRef !== action.uuid && 
        l.endRef !== action.uuid);
}