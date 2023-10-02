
// item
export function createItem(state, item) {
  let newState = { ...state };
  newState[item.uuid] = item;
  return newState;
}

// uuid
export function deleteItem(state, uuid) {
  let newItems = { ...state };
  delete newItems[uuid];
  return newItems;
}

// uuid, update
export function updateItem(state, uuid, update) {
  let item = state[uuid];
  update(item);
  state[uuid] = item;
  return state;
}