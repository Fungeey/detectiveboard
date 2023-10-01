

export default function boardStateReducer(state, action){
    switch (action.type){
        case 'create_item': return createItem(state, action);
        case 'delete_item': return deleteItem(state, action);
        case 'update_item': return updateItem(state, action);
        default: console.error("undefined reducer action: " + action.type);
    }
}

function createItem(state, action){
    let newState = {...state};
    newState[action.item.uuid] = action.item;
    return newState;
}

function deleteItem(state, action){
    let newItems = { ...state };
    delete newItems[action.uuid];
    return newItems;
}

function updateItem(state, action){
    state[action.item.uuid] = action.item;
    return state;
}