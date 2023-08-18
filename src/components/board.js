import { useRef, useState } from 'react';
import useDrag from '../hooks/usedrag';
import useKeyDown from '../hooks/usekeydown';
import useMousePos from '../hooks/usemousepos';
import usePasteImage from '../hooks/usepasteimage';
import useScale from '../hooks/usescale';
import useUndoStack from '../hooks/useundostack';
import util from '../util';
import ContextMenu from './contextmenu';
import Img from './img';
import Line from './line';
import Note from './note';
import Scrap from './scrap';
import UI from './ui';

const noteType = "note";
const imgType = "img";
const scrapType = "scrap";
const lineType = "line";
const debug = false;

const Board = () => {
    const [items, setItems] = useState({});
    const [lines, setLines] = useState([]);
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
        if (dist < 2 && e.button === 0) {
            setIsCreating(false);
        }
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

    function makeLine(uuid, endUuid) {
        if (endUuid == null || endUuid === "")
            return;

        let line = {
            startRef: uuid,
            endRef: endUuid,
            start: items[uuid].pos,
            end: items[endUuid].pos,
            uuid: util.getUUID(lineType)
        };

        for (let i = 0; i < lines.length; i++) {
            let other = lines[i];

            let exists = other.startRef === line.startRef
                && other.endRef === line.endRef;

            let existsBackwards = other.startRef === line.endRef
                && other.endRef === line.startRef;

            if (exists || existsBackwards) {
                // if the line exists already, remove it
                doAction({
                    do: () => removeLine(other),
                    undo: () => addLine(other)
                })
                return;
            }
        }

        doAction({
            do: () => addLine(line),
            undo: () => removeLine(line)
        })
    }

    function removeLine(line) {
        let newLines = lines.filter(l => l.uuid !== line.uuid);
        setLines(newLines);

        for (const uuid in items) {
            if (newLines.filter(l => l.startRef === uuid || l.endRef === uuid).length === 0)
                modifyItem(uuid, item => item.isConnected = false);
        }
    }

    function addLine(line) {
        modifyItem(line.startRef, item => item.isConnected = true);
        modifyItem(line.endRef, item => item.isConnected = true);
        setLines(lines => [...lines, line]);
    }

    function modifyItem(uuid, modify) {
        let newItems = { ...items };
        modify(newItems[uuid]);
        setItems(newItems);
    }

    function updateItem(uuid, update) {
        modifyItem(uuid, update);
        updateLines(uuid);
    }

    // update the line to match the new item positions
    function updateLines(uuid) {
        let newLines = [...lines];
        newLines.forEach(line => {
            if (line.startRef === uuid)
                line.start = util.roundPos(items[uuid].pos);
            else if (line.endRef === uuid)
                line.end = util.roundPos(items[uuid].pos);
        })
        setLines(newLines);
    }

    // Add a new note
    function addNote() {
        if (input.text === "" || input.pos === {})
            return;

        let type = input.text.substring(0, 1) === '/' ? scrapType : noteType;
        if (type == scrapType) input.text = input.text.substring(1);

        createItem({
            type: type,
            pos: input.pos,
            color: "#feff9c",
            size: { width: 150, height: 100 },
            text: input.text
        });
    }

    // paste images and make new img item
    usePasteImage((src) => {
        let boardPos = util.subPos(mousePos.current, getBoardPos());
        createItem({
            type: imgType,
            pos: util.mulPos(boardPos, 1 / scale),
            size: { width: 300, height: 300 },
            src: src
        });
    });

    function createItem(item) {
        item.uuid = util.getUUID(item.type);

        doAction({
            id: "make " + item.uuid,
            do: () => addItem(item),
            undo: () => deleteItem(item.uuid)
        })
    }

    function modifyItemAction(doAction, undoAction) {
        doAction({
            do: modifyItem(doAction),
            undo: modifyItem(undoAction)
        });
    }

    function addItem(item) {
        item.isConnected = false;

        let itemsCopy = { ...items };
        itemsCopy[item.uuid] = item;
        setItems(itemsCopy);
    }

    function deleteItem(uuid) {
        let newItems = { ...items };
        delete newItems[uuid];
        setItems(newItems);

        let newLines = lines.filter(l => l.startRef !== uuid && l.endRef !== uuid);
        setLines(newLines);
    }

    function onLoad(data) {
        setItems(data.items);
        setLines(data.lines);
    }

    // UI's version of data is updating every frame, following the board.

    // 1. Board's data model 
    // should update every frame, to display the notes moving incrementally
    // 2. UI / Save's data model
    // should update every action, ie move from a to b.

    // Render
    return <div onMouseDown={onMouseDown} onDoubleClick={onDoubleLClick} style={{ overflow: 'hidden' }}>
        <UI data={{ items: items, lines: lines }} onLoad={onLoad} />

        <div id='boardWrapper' style={util.scaleStyle(scale)} scale={scale}>
            <div className='board' ref={boardRef} style={util.posStyle(boardPos)}>
                <ContextMenu boardPos={getBoardPos} />
                <p style={{ position: 'absolute' }}></p>

                {isCreating ?
                    <input style={{ ...util.posStyle(input.pos), position: 'absolute' }} autoFocus={true} onChange={(e) => setInput({ pos: input.pos, text: e.target.value })}>
                    </input>
                    : <></>}

                {renderLines()}
                {renderItems()}
            </div>
        </div>
    </div>

    function renderLines() {
        let lineHTML = [];

        for (const line of lines) {
            const topLeft = {
                x: Math.min(line.start.x, line.end.x),
                y: Math.min(line.start.y, line.end.y)
            };

            let lineSize = util.lineSize(line);

            if (!withinViewport(topLeft, lineSize)) continue;

            lineHTML.push(
                <Line key={line.uuid} start={line.start} end={line.end} />);
        }

        return lineHTML;
    }

    function renderItems() {
        let itemHTML = [];

        for (const uuid in items) {
            let item = items[uuid];

            let props = {
                update: updateItem,
                makeLine: makeLine,
                items: items,
                boardPos: getBoardPos,
                addItem: createItem,
                deleteItem: deleteItem,
                debug: debug,
                item: item
            }

            if (!withinViewport(item.pos, item.size)) continue;

            let newItemHtml;
            if (item.type === noteType)
                newItemHtml = <Note key={item.uuid} props={props} />
            else if (item.type === imgType)
                newItemHtml = <Img key={item.uuid} props={props} />
            else if (item.type === scrapType)
                newItemHtml = <Scrap key={item.uuid} props={props} />

            itemHTML.push(newItemHtml);
        }

        return itemHTML;
    }

    function withinViewport(pos, size) {
        let boardPos = util.addPos(util.mulPos(pos, scale), getBoardPos());
        let scaledSize = { width: size.width * scale, height: size.height * scale };

        let leftEdge = boardPos.x + scaledSize.width > 0;
        let rightEdge = boardPos.x - scaledSize.width < (document.documentElement.clientWidth || window.innerWidth);

        let topEdge = boardPos.y + scaledSize.height > 0;
        let bottomEdge = boardPos.y - scaledSize.height < (window.innerHeight || document.documentElement.clientHeight);

        return leftEdge && rightEdge && topEdge && bottomEdge;
    }
}

export default Board;