
// item
export function createItem(state, item) {
  let newState = { ...state };
  newState[item.uuid] = item;
  return newState;
}

// item
export function deleteItem(state, item) {
  let newItems = { ...state };
  delete newItems[item.uuid];
  return newItems;
}

// uuid, update
export function updateItem(state, uuid, update) {
  let newState = { ...state };
  let item = newState[uuid];
  update(item);
  return newState;
}