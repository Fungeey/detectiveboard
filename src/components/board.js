import { useState, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid';
import ContextMenu from './contextmenu';
import useDrag from '../hooks/usedrag';
import useKeyDown from '../hooks/usekeydown'
import usePasteImage from '../hooks/usepasteimage'
import useMousePos from '../hooks/usemousepos'
import util from './util';
import Line from './line';
import Note from './note';
import Img from './img';

const noteType = "note";
const imgType = "img";

const Board = () => {
    const [items, setItems] = useState({});
    const itemsRef = useRef();
    itemsRef.current = items;

    const [lines, setLines] = useState([]);
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
            onClick(e);
        }
    }

    function onClick(e) {
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

    // the first value (null) of mousePos is being passed through
    // how to pass the updated value ???

    // https://stackoverflow.com/questions/62647970/how-to-get-the-updated-value-of-a-state-from-a-callback-method

    // make paste images
    usePasteImage((src) => {

        // make a new img item 
        let uuid = uuidv4();
        let itemsCopy = {...itemsRef.current};

        itemsCopy[uuid] = {
            type:"img",
            uuid:uuid,
            pos:util.subPos(mousePos.current, getBoardPos()),
            isConnected:false,
            src:src
        };

        setItems(itemsCopy);
    });

    // console

    // Render
    return <div className='boardWrapper' onMouseDown = {onMouseDown}>        
        <div className='board' ref = {boardRef} style = {util.posStyle(pos)}>
            <ContextMenu/>
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

            // note: pos, text, uuid
            if(item.type === noteType)
                itemHTML.push(
                    <Note key={item.uuid} item={item} boardPos={getBoardPos} update={updateNote} makeLine={makeLine}/>
                );
            else if(item.type === imgType)
                itemHTML.push(
                    <Img key={item.uuid} item={item} boardPos={getBoardPos}
                    update={updateNote} makeLine={makeLine}/>
                );
        }

        return itemHTML;
    }
}

export default Board;