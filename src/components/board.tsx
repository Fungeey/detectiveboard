import React, {
  useRef,
  useState,
  useEffect,
  useReducer,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';

// hooks
import { useMousePos, useKeyDown, useScale } from '../hooks/listeners';
import usePasteImage from '../hooks/usepasteimage';
import useSelectionBehavior from '../hooks/useselectionbehavior';
import useDrag from '../hooks/usedrag';

// state
import { ActionType } from '../state/boardstatereducer';
import undoable, { OmniState } from '../state/undoable';
import util, { Util } from '../util';

// components
import ContextMenu from './contextmenu';
import BoardBackground from './boardbackground';
import Img from './img';
import Line from './line';
import Note from './note';
import Scrap from './scrap';
import UI from './ui';
import { useGlobalContext, UserMode } from '../state/context';
import {
  Point,
  NoteItem,
  State,
  ItemType,
  ImageItem,
  LineItem,
  Size,
  ScrapItem,
} from '../types/index';

// API for loading/saving board state from backend
import { loadBoard, saveBoard } from '../apiBoard';

const debug = false;

function initData(present: State): OmniState {
  return {
    past: [],
    present: present,
    future: [],
    temporaryPresent: [],
  };
}

interface BoardProps {
  boardId: string;
}

export default function Board({ boardId }: BoardProps) {
  const [data, dispatch] = useReducer(
    undoable,
    initData({
      items: {},
      lines: [],
    })
  );

  // Has the initial load finished? (Prevents overwriting server state with empty board)
  const [isInitialized, setIsInitialized] = useState(false);

  // Throttled saver: when called with { boardId, state }, it will save at most once per 1s
  const saveBoardThrottled = useRef(
    util.throttle(
      (payload: { boardId: string; state: State }) => {
        saveBoard(payload.boardId, payload.state).catch((err) => {
          console.error('Failed to save board state', err);
        });
      },
      1000 // ms
    )
  ).current;

  // Load board state from API when boardId changes
  useEffect(() => {
    let cancelled = false;

    async function fetchBoard() {
      try {
        const state = await loadBoard(boardId);
        if (cancelled) return;

        if (state) {
          // Assume state is a valid `State` object (as saved previously)
          dispatch({ type: ActionType.LOAD, data: state as State });
        }
      } catch (err) {
        console.error('Failed to load board state for', boardId, err);
        // If loading fails, we just keep the default empty board
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
        }
      }
    }

    fetchBoard();

    return () => {
      cancelled = true;
    };
  }, [boardId, dispatch]);

  // Auto-save whenever the board changes *after* initial load
  useEffect(() => {
    if (!isInitialized) return;
    saveBoardThrottled({ boardId, state: data.present });
  }, [boardId, data.present, isInitialized, saveBoardThrottled]);

  const [, setTick] = React.useState(0);
  const forceUpdate = React.useCallback(
    () => setTick((tick) => tick + 1),
    []
  );
  const debouncedForceUpdate = useRef(util.throttle(forceUpdate, 50)).current;
  const getScale = useScale(() => {
    debouncedForceUpdate();
  });

  const boardRef = useRef<HTMLDivElement | null>(null);

  useSelectionBehavior(data.present, dispatch);

  const [isCreating, setIsCreating] = useState(false);
  const { userMode, setUserMode } = useGlobalContext();

  const [input, setInput] = useState<{
    pos?: Point;
    text: string;
  }>({ pos: undefined, text: '' });

  const getMousePos = useMousePos();

  const getBoardPos = useCallback((): Point => {
    if (!boardRef || !boardRef.current) return { x: 0, y: 0 };

    const rect = boardRef.current.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, []);

  const [selectBox, setSelectBox] = useState<{ pos: Point; size: Size }>();
  const [boardPos, setBoardPos] = useState<Point>({ x: 0, y: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [elements, setElements] = useState<
    { rect: DOMRect; element: HTMLElement }[]
  >([]);

  function startPan(p: Point, e: React.PointerEvent): Point[] {
    const bounding: { rect: DOMRect; element: HTMLElement }[] = [];
    document.querySelectorAll('.itemWrapper').forEach((el) => {
      bounding.push({
        rect: el.getBoundingClientRect(),
        element: el as HTMLElement,
      });
    });
    setElements(bounding);

    return [boardPos];
  }

  function isColliding(rect1: DOMRect, rect2: DOMRect) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  function onDrag(newPos: Point[], e: PointerEvent, startPos: Point) {
    const mousePos = { x: e.clientX, y: e.clientY };

    if (dragButton === Util.MouseButton.LMB) {
      // draw selection box

      const pos = { ...startPos };
      const size = Util.asSize(Util.subPos(mousePos, startPos));

      if (size.width < 0) pos.x = pos.x - Math.abs(size.width);
      if (size.height < 0) pos.y = pos.y - Math.abs(size.height);

      const absSize = {
        width: Math.abs(size.width),
        height: Math.abs(size.height),
      };
      setSelectBox({ pos, size: absSize });
      const selectRect = new DOMRect(pos.x, pos.y, absSize.width, absSize.height);

      elements.forEach((el) => {
        const isItemWrapper =
          Array.from(el.element.classList).filter((e) => e === 'itemWrapper')
            .length !== 0;

        if (isItemWrapper) {
          el.element = el.element.children[0] as HTMLElement;
        }

        const uuid = el.element.dataset.uuid;

        if (isColliding(selectRect, el.rect)) {
          if (uuid)
            dispatch({
              type: ActionType.UPDATE_ITEM,
              uuid: uuid,
              update: (item) => (item.isSelected = true),
              skipUndo: true,
            });
        } else {
          dispatch({
            type: ActionType.UPDATE_ITEM,
            uuid: uuid,
            update: (item) => (item.isSelected = false),
            skipUndo: true,
          });
        }
      });
    } else if (dragButton === Util.MouseButton.RMB) {
      // pan the board
      setBoardPos(newPos[0]);
      setIsGrabbing(true);
    }
  }

  function endPan(dist: number, e: MouseEvent, endPositions: Point[]) {
    if (dragButton === Util.MouseButton.LMB) {
      // clear select box
      setSelectBox(undefined);

      if (dist < 2) {
        // click event
        setIsCreating(false);
        return;
      }
    } else if (dragButton === Util.MouseButton.RMB) {
      setIsGrabbing(false);
    }
  }

  const { startDrag, dragButton } = useDrag(startPan, onDrag, endPan);

  function onDoubleLClick(e: React.MouseEvent) {
    if (e.button !== Util.MouseButton.LMB) return;

    // suppress usual LMB drag
    setSelectBox(undefined);

    // cancel out of creating, if clicked elsewhere
    if (isCreating && input.text === '') {
      setIsCreating(false);
      return;
    }

    const pos = { x: e.clientX, y: e.clientY };
    writeNote(pos);
  }

  function onLClick(e: React.MouseEvent) {
    if (userMode === UserMode.CARD) {
      const pos = { x: e.clientX, y: e.clientY };
      writeNote(pos);
      setUserMode?.(UserMode.SELECT);
    }
  }

  function writeNote(pos: Point) {
    // open text window
    const boardPos = util.subPos(pos, getBoardPos());

    setInput({
      pos: util.mulPos(boardPos, 1 / getScale()),
      text: '',
    });

    setIsCreating(true);
  }

  useKeyDown(() => {
    addNote();
    setInput({ pos: undefined, text: '' });
    setIsCreating(false);
  }, ['Enter']);

  useKeyDown(() => {
    setIsCreating(false);
  }, ['Escape']);

  function addNote() {
    if (input.text === '' || !input.pos) return;

    let type = ItemType.NOTE;
    if (input.text.substring(0, 1) === '/') {
      type = ItemType.SCRAP;
      input.text = input.text.substring(1);
    }

    const item: NoteItem = {
      type: type,
      uuid: util.getUUID(type),
      pos: input.pos,
      color: '#feff9c',
      size: { width: 150, height: 100 },
      text: input.text,
      isSelected: false,
      isFrozen: false,
      isConnected: false,
    };

    dispatch({ type: ActionType.CREATE_ITEM, item: item });
  }

  useKeyDown((e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      dispatch({ type: ActionType.UNDO });
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      dispatch({ type: ActionType.REDO });
    }
  }, []);

  usePasteImage((src: string) => {
    if (!getMousePos) return;
    const boardPos = util.subPos(getMousePos(), getBoardPos());

    const img: ImageItem = {
      type: ItemType.IMG,
      uuid: util.getUUID(ItemType.IMG),
      pos: util.mulPos(boardPos, 1 / getScale()),
      size: { width: 300, height: 300 },
      imgSrc: src,
      isSelected: false,
      isConnected: false,
    };

    dispatch({ type: ActionType.CREATE_ITEM, item: img });
  });

  function onLoad(newData: State) {
    dispatch({ type: ActionType.LOAD, data: newData });
  }

  function withinViewport(pos: Point, size: Size): boolean {
    const boardPos = util.addPos(
      util.mulPos(pos, getScale()),
      getBoardPos()
    );
    const scaledSize = {
      width: size.width * getScale(),
      height: size.height * getScale(),
    };

    return (
      boardPos.x + scaledSize.width > 0 &&
      boardPos.x - scaledSize.width <
        (document.documentElement.clientWidth || window.innerWidth) &&
      boardPos.y + scaledSize.height > 0 &&
      boardPos.y - scaledSize.height <
        (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  const renderLines = useMemo((): ReactNode[] => {
    return data.present.lines.map((line: LineItem) => {
      const topLeft = {
        x: Math.min(line.start.x, line.end.x),
        y: Math.min(line.start.y, line.end.y),
      };

      // if (!withinViewport(topLeft, util.lineSize(line))) return null;

      return <Line key={line.uuid} start={line.start} end={line.end} />;
    });
  }, [data.present.lines]);

  const renderItems = useMemo((): ReactNode[] => {
    return Object.values(data.present.items).map((item) => {
      // if (!withinViewport(item.pos, item.size)) return null;

      const props = {
        dispatch: dispatch,
        data: data.present,
        getBoardPos: getBoardPos,
        debug: debug,
      };

      if (item.type === ItemType.NOTE)
        return <Note key={item.uuid} item={item as NoteItem} {...props} />;
      else if (item.type === ItemType.IMG)
        return <Img key={item.uuid} item={item as ImageItem} {...props} />;
      else if (item.type === ItemType.SCRAP)
        return <Scrap key={item.uuid} item={item as ScrapItem} {...props} />;
      else return null;
    });
  }, [data.present]);

  return (
    <div
      onPointerDown={startDrag}
      onClick={onLClick}
      onDoubleClick={onDoubleLClick}
      style={{ overflow: 'hidden' }}
      className={isGrabbing ? 'cursorGrabbing' : ''}
    >
      <UI allData={data} onLoad={onLoad} dispatch={dispatch} />

      <div
        id="boardWrapper"
        className={userMode === UserMode.CARD ? 'cursorCard' : ''}
        style={util.scaleStyle(getScale())}
      >
        <BoardBackground scale={getScale} boardPos={boardPos} />

        <div
          className="board"
          ref={boardRef}
          style={util.posStyle(boardPos)}
        >
          <ContextMenu />
          <p style={{ position: 'absolute' }}></p>

          {isCreating && input.pos ? (
            <input
              style={{ ...Util.posStyle(input.pos), position: 'absolute' }}
              autoFocus={true}
              name="createTextBox"
              onChange={(e) =>
                setInput({ pos: input.pos!, text: e.target.value })
              }
            />
          ) : null}

          {renderLines}
          {renderItems}
        </div>

        {selectBox && (
          <div
            id="select_box"
            className="selected_box"
            style={{
              position: `absolute`,
              top: `${selectBox.pos.y}px`,
              left: `${selectBox.pos.x}px`,
              width: `${selectBox.size.width}px`,
              height: `${selectBox.size.height}px`,
            }}
          />
        )}
      </div>
    </div>
  );
}