import { useState, useRef} from 'react';
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

const Board = ({board}) => {
    const [items, setItems] = useState({});
    const [lines, setLines] = useState([]);
    board.current = {
        data: {items:items, lines:lines}, 
        onLoad:(data) => { setItems(data.items); setLines(data.lines)}
    };

    const boardRef = useRef(null);
    const [isCreating, setIsCreating] = useState(false);
    const [input, setInput] = useState({pos:{}, text:""});
    const mousePos = useMousePos();

    const getBoardPos = () => {
        let rect = boardRef.current.getBoundingClientRect();
        return {x:rect.left, y:rect.top};
    }

    // Panning Board
    function startPan() {
        return pos;
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
            text:input.text
            };

        setItems(noteCopy);
    }

    const [pos, onMouseDown] = useDrag(startPan, null, endPan);

    function makeLine(uuid, endUuid){
        if(endUuid == null || endUuid === "")
            return;

        let line = {startRef:uuid, endRef:endUuid,
            start:items[uuid].pos, end:items[endUuid].pos,
            uuid:uuidv4()
        };

        addLine(line);
    }

    const addLine = (line) => {
        for(let i = 0; i < lines.length; i++){
            let other = lines[i];

            if(other.startRef === line.startRef && other.endRef === line.endRef){
                console.log("That line already exists");
                return;
            }
            if(other.startRef === line.endRef && other.startRef === line.endRef){
                console.log("That line already exists (backwards)");
                return;
            }
        }

        modifyItem(line.startRef, note => note.isConnected = true);
        modifyItem(line.endRef, note => note.isConnected = true);
        setLines([...lines, line]);
    }

    function modifyItem(uuid, modify){
        let newNotes = {...items};
        modify(newNotes[uuid]);
        setItems(newNotes);
    }

    function updateNote(uuid, pos, button){
        modifyItem(uuid, note => {note.pos = pos;});

        // the note is being dragged, update the lines
        if(button !== util.LMB) return;
            updateLines(uuid, pos);    
    }

    // update the line to match the new note positions
    function updateLines(uuid, pos){
        let newLines = [...lines];
        newLines.forEach(line => {
            if(line.startRef === uuid){
                line.start = pos;
            }else if(line.endRef === uuid){
                line.end = pos;
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
            src:src
        };

        setItems(itemsCopy);
    });

    // Render
    return <div className='boardWrapper' onMouseDown = {onMouseDown} ref={board}onDoubleClick={onDoubleLClick}>        
        <div className='board' ref = {boardRef} style = {util.posStyle(pos)}>
            <ContextMenu boardPos={getBoardPos}/>
            <p style = {{position:'absolute'}}></p>

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
                    <Note key={item.uuid} item={item} update={updateNote} makeLine={makeLine}/>
                );
            else if(item.type === imgType)
                itemHTML.push(
                    <Img key={item.uuid} item={item} update={updateNote} makeLine={makeLine}/>
                );
        }

        return itemHTML;
    }
}

export default Board;