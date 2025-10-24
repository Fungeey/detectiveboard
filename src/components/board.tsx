import React, { useRef, useState, useEffect, useReducer, ReactNode, useMemo } from 'react';
import useDrag from '../hooks/usedrag';
import useKeyDown from '../hooks/usekeydown';
import useMousePos from '../hooks/usemousepos';
import usePasteImage from '../hooks/usepasteimage';
import useScale from '../hooks/usescale';
import { ReducerActions } from '../state/boardstatereducer';
import undoable, { OmniState } from '../hooks/undoable';
import util, { Util } from '../util';
import ContextMenu from './contextmenu';
import BoardBackground from './boardbackground';
import Img from './img';
import Line from './line';
import Note from './note';
import Scrap from './scrap';
import UI from './ui';
import { useGlobalContext, UserMode } from '../state/context';
import { Point, NoteItem, State, ItemType, ImageItem, LineItem, Size, ScrapItem } from '../types/index';
import { ActionType } from '../hooks/useundostack';

const debug = false;

function initData(present: State): OmniState {
  return {
    past: [],
    present: present,
    future: [],
    temporaryPresent: []
  }
}

export default function Board() {
  const [data, dispatch] = useReducer(undoable, initData({
    items: {},
    lines: []
  }));

  const [, setTick] = React.useState(0);
  const forceUpdate = React.useCallback(() => setTick(tick => tick + 1), []);
  const debouncedForceUpdate = useRef(util.throttle(forceUpdate, 50)).current;
  const getScale = useScale(() => {
    debouncedForceUpdate();
  });

  const boardRef = useRef<HTMLDivElement | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const { userMode, setUserMode } = useGlobalContext();
  
  const [input, setInput] = useState<{
    pos?: Point,
    text: string
  }>({ pos: undefined, text: "" });
  const getMousePos = useMousePos(() => {});

  function getBoardPos(): Point {
    if(!boardRef || !boardRef.current)
      return { x: 0, y: 0 };
    
    const rect = boardRef.current.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  function startPan(): Point {
    return boardPos;
  }

  function endPan(dist: number, e: MouseEvent) {
    if (dist < 2 && e.button === Util.MouseButton.LMB)
      setIsCreating(false);
  }

  function onDoubleLClick(e: React.MouseEvent) {
    if (e.button !== Util.MouseButton.LMB) return;

    // cancel out of creating, if clicked elsewhere
    if (isCreating && input.text === "") {
      setIsCreating(false);
      return;
    }
    
    const pos = { x: e.clientX, y: e.clientY };
    writeNote(pos);
  }

  function onLClick(e: React.MouseEvent){
    if(userMode === UserMode.CARD && setUserMode) {
      const pos = { x: e.clientX, y: e.clientY };
      writeNote(pos);
      setUserMode(UserMode.SELECT);
    }
  }

  function writeNote(pos: Point){
    // open text window
    const boardPos = util.subPos(pos, getBoardPos());

    setInput({
      pos: util.mulPos(boardPos, 1 / getScale()),
      text: ''
    });

    setIsCreating(true);
  }

  useKeyDown(() => {
    addNote();
    setInput({ pos: undefined, text: "" });
    setIsCreating(false);
  }, ["Enter"]);

  useKeyDown(() => {
    setIsCreating(false);
  }, ["Escape"]);

  const { pos: boardPos, onMouseDown } = useDrag(startPan, null, endPan);

  function addNote() {
    if (input.text === "" || !input.pos)
      return;

    let type = ItemType.NOTE;
    if(input.text.substring(0, 1) === '/'){
      type = ItemType.SCRAP
      input.text = input.text.substring(1);
    }

    const item: NoteItem = {
      type: type,
      uuid: util.getUUID(type),
      pos: input.pos,
      color: "#feff9c",
      size: { width: 150, height: 100 },
      text: input.text,
      isSelected: false,
      isFrozen: false,
      isConnected: false
    };

    dispatch({ type: ReducerActions.CREATE_ITEM, item: item });
  }

  useEffect(() => {
    document.addEventListener('keydown', handleUndoRedo);
    return () => document.removeEventListener('keydown', handleUndoRedo);
  }, []);

  function handleUndoRedo(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      dispatch({ type: ActionType.UNDO });
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      dispatch({ type: ActionType.REDO });
    }
  }

  usePasteImage((src: string) => {
    if(!getMousePos) return;
    const boardPos = util.subPos(getMousePos(), getBoardPos());

    const img: ImageItem = {
      type: ItemType.IMG,
      uuid: util.getUUID(ItemType.IMG),
      pos: util.mulPos(boardPos, 1 / getScale()),
      size: { width: 300, height: 300 },
      imgSrc: src,
      isSelected: false,
      isConnected: false
    }

    dispatch({ type: ReducerActions.CREATE_ITEM, item: img })
  });

  function onLoad(newData: State) {
    dispatch({ type: ReducerActions.LOAD, data: newData });
  }

  function withinViewport(pos: Point, size: Size): boolean {
    const boardPos = util.addPos(util.mulPos(pos, getScale()), getBoardPos());
    const scaledSize = { width: size.width * getScale(), height: size.height * getScale() };

    return (
      boardPos.x + scaledSize.width > 0 &&
      boardPos.x - scaledSize.width < (document.documentElement.clientWidth || window.innerWidth) &&
      boardPos.y + scaledSize.height > 0 &&
      boardPos.y - scaledSize.height < (window.innerHeight || document.documentElement.clientHeight)
    )
  }

  const renderLines = useMemo((): ReactNode[] => {
    return data.present.lines.map((line: LineItem) => {
      const topLeft = {
        x: Math.min(line.start.x, line.end.x),
        y: Math.min(line.start.y, line.end.y)
      };

      if (!withinViewport(topLeft, util.lineSize(line))) return null;

      return <Line key={line.uuid} start={line.start} end={line.end} />
    });
  }, [data.present.lines, withinViewport]);

  const renderItems = useMemo((): ReactNode[] => {
    return Object.values(data.present.items).map((item) => {

      if (!withinViewport(item.pos, item.size)) return null;

      const props = {
        dispatch: dispatch,
        data: data.present,
        getBoardPos: getBoardPos,
        debug: debug,
      }

      if (item.type === ItemType.NOTE)
        return <Note key={item.uuid} item={item as NoteItem} {...props} />;
      else if (item.type === ItemType.IMG)
        return <Img key={item.uuid} item={item as ImageItem} {...props} />;
      else if (item.type === ItemType.SCRAP)
        return <Scrap key={item.uuid} item={item as ScrapItem} {...props} />;
      else
        return null;
    });
  }, [data.present, withinViewport]);

  return (
    <div 
      onPointerDown={onMouseDown} 
      onClick={onLClick} 
      onDoubleClick={onDoubleLClick} 
      style={{ overflow: 'hidden' }}>

      <UI 
        allData={data} 
        onLoad={onLoad} 
        dispatch={dispatch} 
        />

      <div 
        id='boardWrapper' 
        className={ userMode === UserMode.CARD ? 'cursorCard':'' } 
        style={util.scaleStyle(getScale())} 
        /*scale={scale}*/>
        <BoardBackground scale={getScale} boardPos={boardPos} />

        <div className='board' ref={boardRef} style={util.posStyle(boardPos)}>
          <ContextMenu /*boardPos={getBoardPos}*/ />
          <p style={{ position: 'absolute' }}></p>

          {isCreating && input.pos ?
            <input 
              style={{ ...util.posStyle(input.pos), position: 'absolute' }} autoFocus={true} 
              name="createTextBox" 
              onChange={(e) => setInput({ pos: input.pos, text: e.target.value })}>
            </input>
            : <></>}

          {renderLines}
          {renderItems}
        </div>
      </div>
    </div>
  );
}