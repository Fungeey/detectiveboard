

import useDrag from "./usedrag";


// create systems:
// hooks that manage the behaviors instead of components with logic
// grouping and moving requires abstracting out that logic into an outside
// system.


export default function useDragItem(props) {
  function onStartDrag(mousePos, e) {
    console.log(e);
    return { x: 0, y: 0 };
  }

  function onDrag() {

  }

  function onEndDrag() {
    
  }

  const [dragPos, startDrag] = useDrag(onStartDrag, onDrag, onEndDrag);
  return dragPos;
}