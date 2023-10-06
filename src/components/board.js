import { useRef, useState, useReducer } from 'react';
import useDrag from '../hooks/usedrag';
import useKeyDown from '../hooks/usekeydown';
import useMousePos from '../hooks/usemousepos';
import usePasteImage from '../hooks/usepasteimage';
import useScale from '../hooks/usescale';
import useUndoStack from '../hooks/useundostack';
import { boardStateReducer, actions } from '../state/boardstatereducer';
import util from '../util';
import ContextMenu from './contextmenu';
import Img from './img';
import Line from './line';
import Note from './note';
import Scrap from './scrap';
import UI from './ui';

const debug = false;

export default function Board() {
  const [data, dispatch] = useReducer(boardStateReducer, {
    items: {},
    lines: []
  });

  const scale = useScale();
  const boardRef = useRef(null);

  const [isCreating, setIsCreating] = useState(false);
  const [input, setInput] = useState({ pos: {}, text: "" });
  const mousePos = useMousePos();

  const doAction = useUndoStack();

  const getBoardPos = () => {
    let rect = boardRef.current.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  // Panning Board
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

    // open text window, then 
    let pos = { x: e.clientX, y: e.clientY };
    let boardPos = util.subPos(pos, getBoardPos());
    setInput({
      pos: util.mulPos(boardPos, 1 / scale),
      text: ""
    });

    setIsCreating(true);
  }

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
      text: input.text
    };

    doAction({
      do: () => dispatch({ type: actions.createItem, item: item }),
      undo: () => dispatch({ type: actions.deleteItem, item: item })
    });
  }

  // paste images and make new img item
  usePasteImage((src) => {
    let boardPos = util.subPos(mousePos.current, getBoardPos());

    let item = {
      type: util.type.img,
      uuid: util.getUUID(util.type.img),
      pos: util.mulPos(boardPos, 1 / scale),
      size: { width: 300, height: 300 },
      src: src
    }

    doAction({
      do: () => dispatch({ type: actions.createItem, item: item }),
      undo: () => dispatch({ type: actions.deleteItem, item: item })
    });
  });

  function onLoad(newData) {
    doAction({
      do: () => dispatch({ type: actions.load, data: newData }),
      undo: () => dispatch({ type: actions.load, data: data })
    });
  }

  // UI's version of data is updating every frame, following the board.

  // 1. Board's data model 
  // should update every frame, to display the notes moving incrementally
  // 2. UI / Save's data model
  // should update every action, ie move from a to b.

  return <div onMouseDown={onMouseDown} onDoubleClick={onDoubleLClick} style={{ overflow: 'hidden' }}>
    <UI data={data} onLoad={onLoad} />

    <div id='boardWrapper' style={util.scaleStyle(scale)} scale={scale}>
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

    for (const line of data.lines) {
      const topLeft = {
        x: Math.min(line.start.x, line.end.x),
        y: Math.min(line.start.y, line.end.y)
      };

      if (!withinViewport(topLeft, util.lineSize(line))) continue;

      lineHTML.push(
        <Line key={line.uuid} start={line.start} end={line.end} />);
    }

    return lineHTML;
  }

  function renderItems() {
    let itemHTML = [];

    for (const uuid in data.items) {
      let item = data.items[uuid];

      if (!withinViewport(item.pos, item.size)) continue;

      let props = {
        dispatch: dispatch,
        doAction: doAction,
        data: data,
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
    let boardPos = util.addPos(util.mulPos(pos, scale), getBoardPos());
    let scaledSize = { width: size.width * scale, height: size.height * scale };

    return (
      boardPos.x + scaledSize.width > 0 &&
      boardPos.x - scaledSize.width < (document.documentElement.clientWidth || window.innerWidth) &&
      boardPos.y + scaledSize.height > 0 &&
      boardPos.y - scaledSize.height < (window.innerHeight || document.documentElement.clientHeight)
    )
  }
}