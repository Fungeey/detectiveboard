import util from "../util";

function useMouseEvents(
  onLClick: () => void,
  onRClick: () => void
){

  function onClick(e: React.MouseEvent) {
    if (e.button === util.LMB && onLClick) onLClick();
    if (e.button === util.RMB && onRClick) onRClick();
  }

  return [onClick];
}

export default useMouseEvents;