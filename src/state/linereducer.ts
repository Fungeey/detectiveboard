import { LineItem } from "../types/index";

export function createLine(state: LineItem[], line: LineItem) {
  return [...state, line];
}

export function deleteLine(state: LineItem[], line: LineItem) {
  return state.filter(l => l.uuid !== line.uuid);
}

export function updateLine(
  state: LineItem[], 
  uuid: string, 
  update: (line: LineItem) => void
) {
  const newState = [...state];
  const line = newState.find(line => line.uuid === uuid);

  if (line) update(line);
  return newState;
}

export function deleteLinesToItem(state: LineItem[], uuid: string) {
  return state.filter(l =>
    l.startUuid !== uuid &&
    l.endUuid !== uuid);
}