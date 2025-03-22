import { useRef, useState, useEffect, useReducer, useContext  } from 'react';
import useDrag from '../hooks/usedrag';
import useKeyDown from '../hooks/usekeydown';
import useDragItem from '../hooks/usedragitem';
import useMousePos from '../hooks/usemousepos';
import usePasteImage from '../hooks/usepasteimage';
import useScale from '../hooks/usescale';
import { reducerActions } from '../state/boardstatereducer';
import undoable from '../hooks/undoable';
import util from '../util';
import ContextMenu from './contextmenu';
import BoardBackground from './boardbackground';
import Img from './img';
import Line from './line';
import Note from './note';
import Scrap from './scrap';
import UI from './ui';
import { useGlobalContext } from '../state/context';

const debug = false;

function initData(present) {
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

  const scale = useScale();
  const boardRef = useRef(null);

  const [isCreating, setIsCreating] = useState(false);
  const { actionType, setActionType } = useGlobalContext();
  
  const [input, setInput] = useState({ pos: {}, text: "" });
  const mousePos = useMousePos();

  const getBoardPos = () => {
    let rect = boardRef.current.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  function startPan() {
    return boardPos;
  }

  function endPan(dist, e) {
    if (dist < 2 && e.button === 0)
      setIsCreating(false);
  }

  function onDoubleLClick(e) {
    if (e.button !== util.LMB) return;

    // cancel out of creating, if clicked elsewhere
    if (isCreating && input.text === "") {
      setIsCreating(false);
      return;
    }
    
    writeNote(e);
  }

  function onLClick(e){
    if( actionType==util.actions.card ) {
      writeNote(e);
      setActionType(util.actions.select)
    }
  }

  function writeNote(e){

    // open text window
    let pos = { x: e.clientX, y: e.clientY };
    let boardPos = util.subPos(pos, getBoardPos());
    setInput({
      pos: util.mulPos(boardPos, 1 / scale),
      text: ''
    });

    setIsCreating(true);

  }

  useDragItem();

  useKeyDown(() => {
    addNote();
    setInput({ pos: {}, text: "" });
    setIsCreating(false);
  }, ["Enter"]);

  useKeyDown(() => {
    setIsCreating(false);
  }, ["Escape"]);

  const [boardPos, onMouseDown] = useDrag(startPan, null, endPan);

  function addNote() {
    if (input.text === "" || util.isEmpty(input.pos))
      return;

    let type = input.text.substring(0, 1) === '/' ? util.type.scrap : util.type.note;
    if (type === util.type.scrap) input.text = input.text.substring(1);

    let item = {
      type: type,
      uuid: util.getUUID(type),
      pos: input.pos,
      color: "#feff9c",
      size: { width: 150, height: 100 },
      text: input.text,
      isSelected:false,
      isFrozen:false
    };

    dispatch({ type: reducerActions.createItem, item: item });
  }

  useEffect(() => {
    document.addEventListener('keydown', handleUndoRedo);
    return () => document.removeEventListener('keydown', handleUndoRedo);
  }, []);

  function handleUndoRedo(e) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      dispatch({ type: 'UNDO' });
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      dispatch({ type: 'REDO' });
    }
  }

  usePasteImage((src) => {
    let boardPos = util.subPos(mousePos.current, getBoardPos());

    let item = {
      type: util.type.img,
      uuid: util.getUUID(util.type.img),
      pos: util.mulPos(boardPos, 1 / scale),
      size: { width: 300, height: 300 },
      src: src,
      isSelected:false
    }

    dispatch({ type: reducerActions.createItem, item: item })
  });

  function onLoad(newData) {
    dispatch({ type: reducerActions.load, data: newData });
  }

  return <div onMouseDown={onMouseDown} onClick={onLClick} onDoubleClick={onDoubleLClick} style={{ overflow: 'hidden' }}>
    <UI data={data.present} onLoad={onLoad} dispatch={dispatch} allData={data} />

    <div id='boardWrapper' className={ actionType==util.actions.card?'cursorCard':'' } style={util.scaleStyle(scale)} scale={scale}>
      <BoardBackground scale={scale} boardPos={boardPos} />

      <div className='board' ref={boardRef} style={util.posStyle(boardPos)}>
        <ContextMenu boardPos={getBoardPos} />
        <p style={{ position: 'absolute' }}></p>

        {isCreating ?
          <input style={{ ...util.posStyle(input.pos), position: 'absolute' }} autoFocus={true} name="createTextBox" onChange={(e) => setInput({ pos: input.pos, text: e.target.value })}>
          </input>
          : <></>}

        {renderLines()}
        {renderItems()}
      </div>
    </div>
  </div>

  function renderLines() {
    let lineHTML = [];

    const visibleLines = data.present.lines.filter(line => {
      const topLeft = {
        x: Math.min(line.start.x, line.end.x),
        y: Math.min(line.start.y, line.end.y)
      };
      
      return withinViewport(topLeft, util.lineBounds(line))
    })

    for (const line of visibleLines) {
      lineHTML.push(
        <Line key={line.uuid} start={line.start} end={line.end} />);
    }

    return lineHTML;
  }

  function renderItems() {
    let itemHTML = [];

    const visibleItems = Object.values(data.present.items).filter(item => {
      return withinViewport(item.pos, item.size);
    });

    for (const item of visibleItems) {
      let props = {
        dispatch: dispatch,
        data: data.present,
        boardPos: getBoardPos,
        debug: debug,
        item: item
      }

      if (item.type === util.type.note)
        itemHTML.push(<Note key={item.uuid} props={props} />);
      else if (item.type === util.type.img)
        itemHTML.push(<Img key={item.uuid} props={props} />);
      else if (item.type === util.type.scrap)
        itemHTML.push(<Scrap key={item.uuid} props={props} />);
    }

    return itemHTML;
  }

  function withinViewport(pos, size) {
      let itemRealPos = { x: pos.x * scale, y: pos.y * scale };
      let boardRelativePos = util.addPos(itemRealPos, getBoardPos());
      let scaledSize = { width: size.width * scale, height: size.height * scale };
  
      return (
          boardRelativePos.x + scaledSize.width > 0 &&
          boardRelativePos.x < (document.documentElement.clientWidth || window.innerWidth) &&
          boardRelativePos.y + scaledSize.height > 0 &&
          boardRelativePos.y < (window.innerHeight || document.documentElement.clientHeight)
      )
  }
}