import Util from "../../../util";

function useMouseEvents(
  onLClick: () => void,
  onRClick: () => void
){

  function onClick(e: React.MouseEvent) {
    if (e.button === Util.MouseButton.LMB && onLClick) onLClick();
    if (e.button === Util.MouseButton.RMB && onRClick) onRClick();
  }

  return [onClick];
}

export default useMouseEvents;