import { Item } from "../types/index";

export function createItem(
  itemState: Map<string, Item>, 
  item: Item
): Map<string, Item> {
  const newState = { ...itemState };
  newState[item.uuid] = item;
  return newState;
}

export function deleteItem(
  itemState: Map<string, Item>, 
  item: Item
): Map<string, Item> {
  const newItems = { ...itemState };
  delete newItems[item.uuid];
  return newItems;
}

export function updateItem(
  itemState: Map<string, Item>, 
  uuid: string, 
  update: (item: Item) => void
): Map<string, Item> {
  const newState = { ...itemState };
  const item = newState[uuid];
  update(item);
  return newState;
}