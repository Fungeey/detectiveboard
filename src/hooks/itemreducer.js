
export const itemActions = {
    createItem: 'createItem',
    deleteItem: 'deleteItem',
    updateItem: 'updateItem'
}

export function itemReducer(state, action){
    switch (action.type){
        case itemActions.createItem: return createItem(state, action);
        case itemActions.deleteItem: return deleteItem(state, action);
        case itemActions.updateItem: return updateItem(state, action);
        default: console.error("undefined reducer action: " + action.type);
    }
}

// item
function createItem(state, action){
    let newState = {...state};
    newState[action.item.uuid] = action.item;
    return newState;
}

// uuid
function deleteItem(state, action){
    let newItems = { ...state };
    delete newItems[action.uuid];
    return newItems;
}

// uuid, update
function updateItem(state, action){
    let item = state[action.uuid];
    action.update(item);
    state[action.uuid] = item;
    return state;
}