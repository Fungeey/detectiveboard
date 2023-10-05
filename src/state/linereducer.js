
// line
export function createLine(state, line) {
  return [...state, line];
}

// line
export function deleteLine(state, line) {
  return state.filter(l => l.uuid !== line.uuid);
}

// uuid, update
export function updateLine(state, uuid, update) {
  let newState = [...state];
  let line = newState.find(line => line.uuid === uuid);
  if (line)
    update(line);
  return newState;
}

// uuid
export function deleteLinesToItem(state, uuid) {
  return state.filter(l =>
    l.startRef !== uuid &&
    l.endRef !== uuid);
}