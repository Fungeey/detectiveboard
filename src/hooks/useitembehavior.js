import { useEffect, useRef, useState } from "react";
import Line from "../components/line";
import Pin from "../components/pin";
import useCopyPaste from '../hooks/usecopypaste';
import useMousePos from '../hooks/usemousepos';
import useScale from '../hooks/usescale';
import util from "../util";
import useDrag from "./usedrag";
import useSelectionBehavior from "./useselectionbehavior";
import { actions, getExistingLine } from "../state/boardstatereducer";

let hoverUUID = "";

const useItemBehavior = (props) => {
  const [isSelected, select, deselect, renderSelection] = useSelectionBehavior(props);
  const [previewLine, setPreviewLine] = useState({});
  const [startSize, setStartSize] = useState({});
  const scale = useScale();
  const mousePos = useMousePos();

  const [copiedItem, setCopiedItem] = useState(null);

  // shouldn't be able to copy when editing
  function copy() {
    if (!isSelected) {
      setCopiedItem(null); // throw away previously copied item
      return;
    }
    setCopiedItem(props.item);
  }

  function paste() {
    if (copiedItem == null) return;

    let itemCopy = { ...copiedItem };
    let boardPos = util.subPos(mousePos.current, props.boardPos());
    itemCopy.pos = util.mulPos(boardPos, 1 / scale);

    props.addItem(itemCopy);
  }

  useCopyPaste(copy, paste);

  function onStartDrag(mousePos, e) {
    setStartSize(getSize());
    return props.item.pos;
  }

  function onDrag(dragPos, e) {
    if (dragButton === util.LMB) {
      if (!util.eqlSize(getSize(), startSize)) {
        // resizing, don't change position
        return;
      }

      // move the item to the drag position.
      let update = item => item.pos = util.roundPos(dragPos);
      props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: update });

    } else if (dragButton === util.RMB) {
      drawPreviewLine(e);
    }
  }

  function drawPreviewLine(e) {
    if (hoverUUID && props.item.uuid !== hoverUUID) {
      // snap to any item
      setPreviewLine({
        start: props.item.pos,
        end: props.data.items[hoverUUID].pos
      });
    } else {

      // otherwise go to mouse position
      let boardPos = util.subPos(util.getMousePos(e), props.boardPos());
      setPreviewLine({
        start: props.item.pos,
        end: util.mulPos(boardPos, 1 / scale)
      });
    }
  }

  function getSize() {
    let itemElement = itemRef.current.childNodes[0].childNodes[0];
    return {
      width: itemElement.clientWidth,
      height: itemElement.clientHeight,
    }
  }

  // cancel preview line on window unfocus
  useEffect(() => {
    window.addEventListener('blur', () => setPreviewLine({}), false);
    return () =>
      window.removeEventListener('blur', () => setPreviewLine({}), false);
  }, []);

  const onEndDrag = (dist, e, startPos) => {
    if (!util.eqlSize(getSize(), startSize)) { // save new width
      // clientWidth includes padding, so need to subtract it away
      let newSize = getSize();
      let oldSize = props.item.size;

      props.doAction({
        do: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.size = newSize }),
        undo: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.size = oldSize }),
      })

    } else if (dragButton === util.LMB) { // lmb click = select
      if (dist < util.clickDist) {
        select();
        return;
      }

      let newPos = props.item.pos;

      props.doAction({
        do: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.pos = newPos }),
        undo: () => props.dispatch({ type: actions.updateItem, uuid: props.item.uuid, update: item => item.pos = startPos })
      });
    } else if (dragButton === util.RMB) { // connect this item to hovered item
      createLine();
    }

    setPreviewLine({});
  }

  function createLine() {
    if (props.item.uuid === hoverUUID || hoverUUID === "")
      return;

    let line = {
      startRef: props.item.uuid,
      endRef: hoverUUID,
      start: props.item.pos,
      end: props.data.items[hoverUUID].pos,
      uuid: util.getUUID(util.type.line)
    };

    let other = getExistingLine(props.data.lines, line);

    if (Object.keys(other).length !== 0){
      props.doAction({ 
        do: () => props.dispatch({ type: actions.deleteLine, line: other }), 
        undo: () => props.dispatch({ type: actions.createLine, line: other }) 
      });
    }else{
      props.doAction({ 
        do: () => props.dispatch({ type: actions.createLine, line: line }), 
        undo: () => props.dispatch({ type: actions.deleteLine, line: line }) 
      });
    }
  }

  const [dragPos, startDrag, dragButton] = useDrag(onStartDrag, onDrag, onEndDrag);

  function enter() { hoverUUID = props.item.uuid; }
  function exit() { hoverUUID = ""; }

  const itemRef = useRef(null);

  function renderPreviewLine() {
    if (!previewLine.start) return null;

    return <div className="previewLine blink">
      <Line start={previewLine.start} end={previewLine.end}
        key={previewLine.uuid} />
      <Pin pos={previewLine.end} />

      {!props.item.isConnected ?
        <Pin pos={previewLine.start} /> : <></>}
    </div>
  }

  function render(renderItem, renderItemSelection) {
    return <>
      {renderPreviewLine()}
      {props.item.isConnected ? <Pin pos={props.item.pos} /> : <></>}

      <div style={{ ...util.posStyle(props.item.pos) }}>
        <div className="itemWrapper"
          onMouseDown={startDrag}
          onMouseEnter={enter}
          onMouseLeave={exit}
          uuid={props.item.uuid} ref={itemRef}>

          <div className={`itemHolder${isSelected ? ' selected' : ''}`}>
            {renderItem(isSelected)}
          </div>
        </div>

        {isSelected ? renderSelection(itemRef, renderItemSelection) : <></>}
      </div>
    </>
  }

  return [render]
}

export default useItemBehavior;

