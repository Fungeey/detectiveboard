import { useCallback, useEffect, useState } from "react";

export default () => {
  const [anchorPoint, setAnchorPoint] = useState({x:0, y:0});
  const [isVisible, setIsVisible] = useState(false);

  const openContextMenu = useCallback((e) => {
      e.preventDefault()
      setAnchorPoint({ x: e.pageX, y: e.pageY });
      setIsVisible(true);
    }, 
    [setAnchorPoint, setIsVisible]
  )

  const closeContextMenu = useCallback((e) => {
      if(e.button === 2)
        return;
      e.preventDefault()
      setIsVisible(false);
    }, 
    [setAnchorPoint, setIsVisible]
  )

  // board should handle this state
  useEffect(() => {
    document.addEventListener("contextmenu", openContextMenu);
    document.addEventListener("mousedown", closeContextMenu);

    return () => {
      document.removeEventListener("contextmenu", openContextMenu);
      document.removeEventListener("mousedown", closeContextMenu);
    }
  });

  return (
    <div></div>
  );

  // <div style = {{display:isVisible ? 'initial' : 'none', position:'absolute', left:anchorPoint.x + 'px', top:anchorPoint.y + 'px'}}>
  //     <p>this is a context menu</p>
  //   </div>
} 