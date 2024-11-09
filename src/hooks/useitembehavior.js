import { useEffect, useRef, useState } from "react";
import Line from "../components/line";
import Pin from "../components/pin";
import useCopyPaste from '../hooks/usecopypaste';
import useMousePos from '../hooks/usemousepos';
import useScale from '../hooks/usescale';
import util from "../util";
import useDragItem from "./usedragitem";
import useSelectionBehavior from "./useselectionbehavior";
import { reducerActions, getExistingLine } from "../state/boardstatereducer";

let hoverUUID = "";

const useItemBehavior = (props) => {
  const [select, deselect, renderSelection] = useSelectionBehavior(props);
  const [previewLine, setPreviewLine] = useState({});
  const [startSize, setStartSize] = useState({});
  const scale = useScale();
  const mousePos = useMousePos();

  const [copiedItem, setCopiedItem] = useState(null);

  // shouldn't be able to copy when editing
  function copy() {
    if (!props.item.isSelected) {
      setCopiedItem(null); // throw away previously copied item
      return;
    }
    setCopiedItem(props.item);
  }

  function paste() {
    if (copiedItem == null) return;

    let itemCopy = { ...copiedItem };
    itemCopy.uuid = util.getUUID(itemCopy.type);
    itemCopy.isSelected = false;

    let boardPos = util.subPos(mousePos.current, props.boardPos());
    itemCopy.pos = util.mulPos(boardPos, 1 / scale);

    props.dispatch({ type: reducerActions.createItem, item: itemCopy });
  }

  useCopyPaste(copy, paste);

  function onStartDrag(mousePos, e) {
    setStartSize(getSize());

    let startPositions = [props.item.pos];

    for (let uuid in props.data.items) {
      if (uuid === props.item.uuid) continue;
      let item = props.data.items[uuid];
      if (item.isSelected) startPositions.push(item.pos);
    }

    return startPositions;
  }

  function onDrag(dragPositions, e) {
    if (dragButton === util.LMB) {
      if (!util.eqlSize(getSize(), startSize))
        return;

      // move the item to the drag position.
      let update = item => item.pos = dragPositions[0];
      props.dispatch({ type: reducerActions.updateItem, skipUndo: true, uuid: props.item.uuid, update: update });

      let i = 1;
      for (let uuid in props.data.items) {
        if (uuid === props.item.uuid) continue;
        let item = props.data.items[uuid];

        if (item.isSelected) {
          let newPosition = util.clone(dragPositions[i++]);
          let updated = item => item.pos = newPosition;
          props.dispatch({ type: reducerActions.updateItem, skipUndo: true, uuid: uuid, update: updated });
        }
      }

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

  const onEndDrag = (dist, e, endPositions) => {
    if (!util.eqlSize(getSize(), startSize)) { // save new width
      // clientWidth includes padding, so need to subtract it away
      let newSize = getSize();

      props.dispatch({ type: reducerActions.updateItem, uuid: props.item.uuid, update: item => item.size = newSize });

    } else if (dragButton === util.LMB) { // lmb click = select
      if (dist < util.clickDist) {
        select();
        return;
      }

      let actions = [];

      actions.push({ type: reducerActions.updateItem, restorePresent: true, uuid: props.item.uuid, update: item => item.pos = endPositions[0] });

      let i = 1;
      for (let uuid in props.data.items) {
        if (uuid === props.item.uuid) continue;

        if (props.data.items[uuid].isSelected) {
          let newPosition = util.clone(endPositions[i++]);
          let updated = item => item.pos = newPosition;
          actions.push({ type: reducerActions.updateItem, uuid: uuid, update: updated});
        }
      }

      props.dispatch({ type: reducerActions.many, restorePresent: true, actions: actions });

    } else if (dragButton === util.RMB) {
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

    if (util.objIsEmpty(other))
      props.dispatch({ type: reducerActions.createLine, line: line });
    else
      props.dispatch({ type: reducerActions.deleteLine, line: other });
  }

  const [dragPositions, startDrag, dragButton] = useDragItem(onStartDrag, onDrag, onEndDrag);

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

          <div className={`itemHolder${props.item.isSelected ? ' selected' : ''}`}>
            {renderItem(props.item.isSelected)}
          </div>
        </div>

        {props.item.isSelected ? renderSelection(itemRef, renderItemSelection) : <></>}
      </div>
    </>
  }

  return [render]
}

export default useItemBehavior;

