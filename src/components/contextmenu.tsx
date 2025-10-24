import React, { useCallback, useEffect, useState } from "react";
import { Util } from "../util";

const ContextMenu = () => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const openContextMenu = useCallback((e) => {
    e.preventDefault()
    setAnchorPoint({ x: e.pageX, y: e.pageY });
    setIsVisible(true);
  },
    [setAnchorPoint, setIsVisible]
  )

  const closeContextMenu = useCallback((e) => {
    if (e.button === Util.MouseButton.RMB)
      return;
    e.preventDefault()
    setIsVisible(false);
  }, [setIsVisible]);

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

  // <div style={util.posStyle(util.subPos(anchorPoint, props.boardPos))}>
  //     hello
  //   </div>
}

export default ContextMenu;