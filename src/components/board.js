import { useState, useRef, useEffect} from 'react';
import { v4 as uuidv4 } from 'uuid';
import ContextMenu from './contextmenu';
import useDrag from '../hooks/usedrag';
import useKeyDown from '../hooks/usekeydown'
import usePasteImage from '../hooks/usepasteimage'
import useMousePos from '../hooks/usemousepos'
import util from '../util';
import Line from './line';
import Note from './note';
import Img from './img';

const noteType = "note";
const imgType = "img";
const debug = false;

const Board = ({board}) => {
    const [items, setItems] = useState({});
    const [lines, setLines] = useState([]);

    board.current = {
        data: {items:items, lines:lines}, 
        onLoad:(data) => { 
            setItems(data.items); 
            setLines(data.lines);
        }
    };

    const boardRef = useRef(null);
    const [isCreating, setIsCreating] = useState(false);
    const [input, setInput] = useState({pos:{}, text:""});
    const mousePos = useMousePos();

    useEffect(() => {
        // unconnect the hanging items
        for(const uuid in items){
            let item = items[uuid];

            if(lines.filter(l => l.startRef === uuid || l.endRef === uuid).length == 0)
                modifyItem(uuid, item => item.isConnected = false);
        }
    }, [lines])

    const getBoardPos = () => {
        let rect = boardRef.current.getBoundingClientRect();
        return {x:rect.left, y:rect.top};
    }

    // Panning Board
    function startPan() {
        return boardPos;
    }

    function endPan(dist, e) {
        if(dist < 2 && e.button === 0){
            reset();
        }
    }

    function onDoubleLClick(e) {
        if(e.button !== util.LMB) return;

        // cancel out of creating, if clicked elsewhere
        if(isCreating && input.text == ""){
            setIsCreating(false);
            return;
        }

        // open text window, then 
        let pos = { x: e.clientX, y: e.clientY };
        setInput({
            pos: util.subPos(pos, getBoardPos()),
            text: ""
        });

        setIsCreating(true);
    }

    function reset(){
        setIsCreating(false);
    }

    useKeyDown(() => {
        addNote();
        setInput({pos:{}, text:""});
        setIsCreating(false);
    }, ["Enter"]);

    useKeyDown(() => {
        setIsCreating(false);
    }, ["Escape"]);

    // Add a new note
    function addNote(){
        if(input.text === "" || input.pos == {})
            return;

        let uuid = uuidv4();
        let noteCopy = {...items};
        noteCopy[uuid] = {
            type:"note",
            uuid:uuid,
            pos:input.pos, 
            isConnected:false,
            color:"#feff9c",
            size:{width:150, height:100},
            text:input.text
            };

        setItems(noteCopy);
    }

    const [boardPos, onMouseDown] = useDrag(startPan, null, endPan);

    function makeLine(uuid, endUuid){
        if(endUuid == null || endUuid === "")
            return;

        let line = {
            startRef:uuid, 
            endRef:endUuid,
            start:items[uuid].pos, 
            end:items[endUuid].pos,
            uuid:uuidv4()
        };

        addLine(line);
    }

    const addLine = (line) => {
        for(let i = 0; i < lines.length; i++){
            let other = lines[i];

            if(other.startRef === line.startRef && other.endRef === line.endRef
            || other.startRef === line.endRef && other.endRef === line.startRef){
                // if the line exists already, remove it
                setLines(lines.filter(l => l.uuid !== other.uuid));
                return;
            }
        }

        modifyItem(line.startRef, item => item.isConnected = true);
        modifyItem(line.endRef, item => item.isConnected = true);
        setLines([...lines, line]);
    }

    function modifyItem(uuid, modify){
        let newItems = {...items};
        modify(newItems[uuid]);
        setItems(newItems);
    }

    function updateItem(uuid, update){
        modifyItem(uuid, update);
        updateLines(uuid);    
    }

    // update the line to match the new item positions
    function updateLines(uuid, pos){
        let newLines = [...lines];
        newLines.forEach(line => {
            if(line.startRef === uuid){
                line.start = items[uuid].pos;
            }else if(line.endRef === uuid){
                line.end = items[uuid].pos;
            }
        })
        setLines(newLines);
    }

    // make paste images
    usePasteImage((src) => {

        // make a new img item 
        let uuid = uuidv4();
        let itemsCopy = {...board.current.data.items};

        itemsCopy[uuid] = {
            type:"img",
            uuid:uuid,
            pos:util.subPos(mousePos.current, getBoardPos()),
            isConnected:false,
            size:{width:200, height:100},
            src:src
        };

        setItems(itemsCopy);
    });

    function deleteItem(uuid){
        let newItems = {...items};
        delete newItems[uuid];
        setItems(newItems);

        let newLines = lines.filter(l => l.startRef !== uuid && l.endRef !== uuid);
        setLines(newLines);
    }

    // Render
    return <div className='boardWrapper' onMouseDown = {onMouseDown} ref={board}onDoubleClick={onDoubleLClick}>        
        <div className='board' ref = {boardRef} style = {util.posStyle(boardPos)}>
            <ContextMenu boardPos={getBoardPos}/>
            <p style = {{position:'absolute'}}>board</p>

            {isCreating ? 
                <input style = {{...util.posStyle(input.pos), position:'absolute'}} autoFocus={true} onChange={(e) => setInput({pos: input.pos, text:e.target.value})}>
                </input>
            : <></>}

            {renderItems()}

            {lines.map((line) => <Line start={line.start} end={line.end} key={line.uuid}/>)}
        </div>
    </div>

    function renderItems(){
        const itemHTML = [];

        for(const uuid in items){
            let item = items[uuid];

            if(item.type === noteType)
                itemHTML.push(
                    <Note key={item.uuid} item={item} update={updateItem} makeLine={makeLine} items={items} boardPos={getBoardPos} deleteItem={deleteItem} debug={debug}/>
                );
            else if(item.type === imgType)
                itemHTML.push(
                    <Img key={item.uuid} item={item} update={updateItem} makeLine={makeLine} items={items} boardPos={getBoardPos} deleteItem={deleteItem} debug={debug}/>
                );
        }

        return itemHTML;
    }
}

export default Board;