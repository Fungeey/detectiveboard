import React, { ReactElement, ReactNode } from 'react';
import { useEffect, useRef, useState } from "react";
import Line from "../components/line";
import Pin from "../components/pin";
import useCopyPaste from './usecopypaste';
import useMousePos from './usemousepos';
import useScale from './usescale';
import util, { Util } from "../util";
import useDragItem from "./usedragitem";
import useSelectionBehavior from "./useselectionbehavior";
import { ReducerActions, getExistingLine } from "../state/boardstatereducer";
import { Point, State, Item, LineItem, Size, ItemType } from '../types/index';
import { Action } from './useundostack';

let hoverUUID = "";

export interface ItemProps {
  item: Item,
  debug: boolean,
  dispatch: React.Dispatch<Action>,
  getBoardPos: () => Point,
  data: State
}

function useItemBehavior(
  item: Item,
  dispatch: React.Dispatch<Action>,
  getBoardPos: () => Point,
  data: State
): {
  render: (
    renderItem: () => ReactNode, 
    renderItemSelection?: (itemRef: React.Ref<HTMLElement>) => ReactNode
  ) => ReactElement
}{
  const { select, renderSelection } = useSelectionBehavior(item, dispatch);
  const [previewLine, setPreviewLine] = useState<LineItem | null>(null);
  const [startSize, setStartSize] = useState<Size>({ width: 100, height: 100});
  const scale = useScale();
  const mousePos = useMousePos();

  const [copiedItem, setCopiedItem] = useState<Item | null>(null);

  // shouldn't be able to copy when editing
  function copy() {
    if (!item.isSelected) {
      setCopiedItem(null); // throw away previously copied item
      return;
    }
    setCopiedItem(item);
  }

  function paste() {
    if (copiedItem == null || !mousePos) return;

    const itemCopy = { ...copiedItem };
    itemCopy.uuid = util.getUUID(itemCopy.type);
    itemCopy.isSelected = false;

    const boardPos = util.subPos(mousePos, getBoardPos());
    itemCopy.pos = util.mulPos(boardPos, 1 / scale);

    dispatch({ type: ReducerActions.CREATE_ITEM, item: itemCopy });
  }

  useCopyPaste(copy, paste);

  function onStartDrag(mousePos: Point, e: React.MouseEvent): Point[] {
    setStartSize(getSize());

    const startPositions = [item.pos];

    for (const uuid in data.items) {
      if (uuid === item.uuid) continue;

      const otherItem = data.items[uuid];
      if (otherItem.isSelected) 
        startPositions.push(item.pos);
    }

    return startPositions;
  }

  function onDrag(dragPositions: Point[], e: MouseEvent) {
    if (dragButton === Util.MouseButton.LMB) {
      if (!util.eqlSize(getSize(), startSize))
        return;

      if (item.type === ItemType.NOTE && item.isFrozen)
        return;

      // move the item to the drag position.
      const update = (item: Item) => item.pos = dragPositions[0];
      dispatch({ type: ReducerActions.UPDATE_ITEM, skipUndo: true, uuid: item.uuid, update: update });

      let i = 1;
      for (let uuid in data.items) {
        if (uuid === item.uuid) continue;
        const otherItem: Item = data.items[uuid];

        if (otherItem.isSelected) {
          const newPosition = util.clone(dragPositions[i++]);
          const update = (item: Item) => item.pos = newPosition;

          dispatch({ type: ReducerActions.UPDATE_ITEM, skipUndo: true, uuid: otherItem.uuid, update: update });
        }
      }

    } else if (dragButton === Util.MouseButton.RMB) {
      drawPreviewLine(e);
    }
  }

  function drawPreviewLine(e: MouseEvent) {
    if (hoverUUID && item.uuid !== hoverUUID) {
      // snap to any item
      setPreviewLine({
        start: item.pos,
        end: data.items[hoverUUID].pos,
        uuid: 'preview_line'
      });
    } else {

      // otherwise go to mouse position
      const boardPos = util.subPos(util.getMousePos(e), getBoardPos());
      setPreviewLine({
        start: item.pos,
        end: util.mulPos(boardPos, 1 / scale),
        uuid: 'preview_line'
      });
    }
  }

  function getSize(): Size {
    if(!itemRef.current) return { width: 0, height: 0};

    const itemElement = itemRef.current.childNodes[0].childNodes[0] as HTMLDivElement;
    return {
      width: itemElement.clientWidth,
      height: itemElement.clientHeight,
    }
  }

  // cancel preview line on window unfocus
  useEffect(() => {
    window.addEventListener('blur', () => setPreviewLine(null), false);
    return () =>
      window.removeEventListener('blur', () => setPreviewLine(null), false);
  }, []);

  function onEndDrag(
    dist: number, 
    e: MouseEvent, 
    endPositions: Point[]
  ){
    const newSize = getSize();

    if (newSize != null && !util.eqlSize(getSize(), startSize)) { // save new width
      // clientWidth includes padding, so need to subtract it away

      dispatch({ type: ReducerActions.UPDATE_ITEM, uuid: item.uuid, update: item => item.size = newSize });

    } else if (dragButton === Util.MouseButton.LMB) { // lmb click = select
      if (dist < 2) {
        select();
        return;
      }

      if(item.type === ItemType.NOTE && item.isFrozen)
        return;

      const actions: Action[] = [];

      actions.push({ type: ReducerActions.UPDATE_ITEM, restorePresent: true, uuid: item.uuid, update: (item) => {
        item.pos = endPositions[0] 
      }});

      let i = 1;
      for (let uuid in data.items) {
        if (uuid === item.uuid) continue;

        if (data.items[uuid].isSelected) {
          const newPosition = util.clone(endPositions[i++]);
          const updated = (item: Item) => item.pos = newPosition;
          actions.push({ type: ReducerActions.UPDATE_ITEM, uuid: uuid, update: updated});
        }
      }

      dispatch({ type: ReducerActions.MANY, restorePresent: true, actions: actions });

    } else if (dragButton === Util.MouseButton.RMB) {
      createLine();
    }

    setPreviewLine(null);
  }

  function createLine() {
    if (item.uuid === hoverUUID || hoverUUID === "")
      return;

    const line: LineItem = {
      start: item.pos,
      end: data.items[hoverUUID].pos,
      startUuid: item.uuid,
      endUuid: hoverUUID,
      uuid: util.getUUID(ItemType.LINE)
    };

    const other = getExistingLine(data.lines, line);

    if (!other)
      dispatch({ type: ReducerActions.CREATE_LINE, line: line });
    else
      dispatch({ type: ReducerActions.DELETE_LINE, line: other });
  }

  const { startDrag, dragButton } = useDragItem(
    onStartDrag, onDrag, onEndDrag
  );

  function enter() { hoverUUID = item.uuid; }
  function exit() { hoverUUID = ""; }

  const itemRef = useRef<HTMLDivElement>(null);

  function renderPreviewLine(): ReactNode {
    if (!previewLine) return <></>;

    return (
      <div className="previewLine blink">
        <Line start={previewLine.start} end={previewLine.end}
          key={previewLine.uuid} />
        <Pin pos={previewLine.end} />

        {!item.isConnected ?
          <Pin pos={previewLine.start} /> : <></>}
      </div>
    )
  }

  function render(
    renderItem: () => ReactNode, 
    renderItemSelection?: (itemRef: React.Ref<HTMLElement>) => ReactNode
  ): ReactElement {
    return <>
      {renderPreviewLine()}
      {item.isConnected ? <Pin pos={item.pos} /> : <></>}

      <div className="elementContent" style={{ ...util.posStyle(item.pos) }}>
        <div className="itemWrapper">
          <div className="itemElement"
            onPointerDown={startDrag}
            onMouseEnter={enter}
            onMouseLeave={exit}
            data-uuid={item.uuid} ref={itemRef}>

            <div className={`itemHolder${item.isSelected ? ' selected' : ''}`}>
              {renderItem()}
            </div>
          </div>

          {item.isSelected && renderItemSelection 
          ? renderSelection(itemRef, renderItemSelection) : <></>}
        </div>
      </div>
    </>
  }

  return {render};
}

export default useItemBehavior;