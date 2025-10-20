import { Item } from "../types/index";

export function createItem(
  itemState: Record<string, Item>, 
  item: Item
): Record<string, Item> {
  const newState = { ...itemState };
  newState[item.uuid] = item;
  return newState;
}

export function deleteItem(
  itemState: Record<string, Item>, 
  item: Item
): Record<string, Item> {
  const newItems = { ...itemState };
  delete newItems[item.uuid];
  return newItems;
}

export function updateItem(
  itemState: Record<string, Item>, 
  uuid: string, 
  update: (item: Item) => void
): Record<string, Item> {
  const newState = { ...itemState };
  const item = newState[uuid];
  update(item);
  return newState;
}